using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Application.Services;

public class InstitutionResolutionService
{
    private readonly RorService _rorService;
    private readonly IApplicationDbContext _context;
    private readonly IInstitutionDomainRepository _institutionDomainRepository;
    private readonly IInstitutionRepository _institutionRepository;
    private static readonly TimeSpan RorRetryWindow = TimeSpan.FromDays(30);

    public InstitutionResolutionService(
        RorService rorService,
        IApplicationDbContext context,
        IInstitutionDomainRepository institutionDomainRepository,
        IInstitutionRepository institutionRepository
    )
    {
        _rorService = rorService;
        _context = context;
        _institutionDomainRepository = institutionDomainRepository;
        _institutionRepository = institutionRepository;
    }

    public async Task<Institution?> ResolveByEmailDomainAsync(
        string emailDomain,
        CancellationToken cancellationToken
    )
    {
        var normalized = emailDomain.Trim().ToLowerInvariant();

        var localDomain = await _institutionDomainRepository.GetDomainWithIncludeInstitutionAsync(
            x => x.Domain == normalized,
            cancellationToken
        );

        if (localDomain != null)
            return await EnrichWithRorIfMissingAsync(localDomain.Institution, cancellationToken);

        var parts = normalized.Split('.');
        for (int i = 1; i < parts.Length - 1; i++)
        {
            var candidate = string.Join('.', parts.Skip(i));
            var match = await _institutionDomainRepository.GetDomainWithIncludeInstitutionAsync(
                x => x.Domain == candidate,
                cancellationToken
            );

            if (match != null)
            {
                var enriched = await EnrichWithRorIfMissingAsync(
                    match.Institution,
                    cancellationToken
                );
                await CacheSubdomainAsync(normalized, enriched, cancellationToken);
                return enriched;
            }
        }

        var rorResult = await _rorService.FindByDomainAsync(normalized, cancellationToken);
        if (rorResult != null)
        {
            var institution = await FindOrCreateInstitutionFromRorAsync(
                rorResult,
                cancellationToken
            );

            await _institutionDomainRepository.AddAsync(
                new InstitutionDomain
                {
                    Id = Guid.NewGuid(),
                    Domain = normalized,
                    InstitutionId = institution.Id,
                },
                cancellationToken
            );
            await _context.CompleteAsync(cancellationToken);

            return institution;
        }

        return null;
    }

    private async Task CacheSubdomainAsync(
        string subdomain,
        Institution institution,
        CancellationToken cancellationToken
    )
    {
        var exists = await _institutionDomainRepository.AnyAsync(
            x => x.Domain == subdomain,
            cancellationToken
        );

        if (exists)
            return;

        await _institutionDomainRepository.AddAsync(
            new InstitutionDomain
            {
                Id = Guid.NewGuid(),
                Domain = subdomain,
                InstitutionId = institution.Id,
            },
            cancellationToken
        );

        await _context.CompleteAsync(cancellationToken);
    }

    private async Task<Institution> FindOrCreateInstitutionFromRorAsync(
        RorSearchResult rorResult,
        CancellationToken cancellationToken
    )
    {
        var existing = await _institutionRepository.FirstOrDefaultAsync(
            x => x.RorId == rorResult.Organization.Id,
            cancellationToken
        );

        if (existing != null)
            return existing;

        var displayName =
            rorResult.Organization.Names.FirstOrDefault(n => n.Types.Contains("ror_display"))?.Value
            ?? rorResult.Organization.Names.FirstOrDefault()?.Value
            ?? "Unknown";

        var institution = new Institution
        {
            Id = Guid.NewGuid(),
            Name = displayName,
            Country = rorResult
                .Organization.Locations?.FirstOrDefault()
                ?.GeonamesDetails?.CountryName,
            AlphaTwoCode = rorResult
                .Organization.Locations?.FirstOrDefault()
                ?.GeonamesDetails?.CountryCode,
            RorId = rorResult.Organization.Id,
            ResolutionMethod = rorResult.Method,
            RorLookupAttemptedAt = DateTime.UtcNow,
            SyncedAt = DateTime.UtcNow,
        };

        await _institutionRepository.AddAsync(institution, cancellationToken);
        await _context.CompleteAsync(cancellationToken);
        return institution;
    }

    private async Task<Institution> EnrichWithRorIfMissingAsync(
        Institution institution,
        CancellationToken cancellationToken
    )
    {
        if (!string.IsNullOrWhiteSpace(institution.RorId))
            return institution;

        if (
            institution.RorLookupAttemptedAt.HasValue
            && DateTime.UtcNow - institution.RorLookupAttemptedAt.Value < RorRetryWindow
        )
        {
            return institution;
        }

        var domainRows = await _institutionDomainRepository.GetAllWithFilterAsync(
            x => x.InstitutionId == institution.Id,
            cancellationToken
        );

        RorSearchResult? confirmedMatch = null;

        foreach (var domainRow in domainRows)
        {
            var rorResult = await _rorService.FindByDomainAsync(
                domainRow.Domain,
                cancellationToken
            );
            if (rorResult == null)
                continue;

            var rorDisplayName =
                rorResult
                    .Organization.Names.FirstOrDefault(n => n.Types.Contains("ror_display"))
                    ?.Value
                ?? rorResult.Organization.Names.FirstOrDefault()?.Value
                ?? string.Empty;

            if (IsLikelySameOrganization(institution.Name, rorDisplayName))
            {
                confirmedMatch = rorResult;
                break;
            }

            await ReclassifyDomainAsync(domainRow, rorResult, cancellationToken);
        }

        if (confirmedMatch == null)
        {
            confirmedMatch = await _rorService.SearchByNameAsync(
                institution.Name,
                institution.Country,
                cancellationToken
            );
        }

        institution.RorLookupAttemptedAt = DateTime.UtcNow;

        if (confirmedMatch == null)
        {
            await _context.CompleteAsync(cancellationToken);
            return institution;
        }

        institution.RorId = confirmedMatch.Organization.Id;
        institution.ResolutionMethod = confirmedMatch.Method;
        institution.Country ??= confirmedMatch
            .Organization.Locations?.FirstOrDefault()
            ?.GeonamesDetails?.CountryName;
        institution.AlphaTwoCode ??= confirmedMatch
            .Organization.Locations?.FirstOrDefault()
            ?.GeonamesDetails?.CountryCode;
        institution.SyncedAt = DateTime.UtcNow;

        await _context.CompleteAsync(cancellationToken);
        return institution;
    }

    private static bool IsLikelySameOrganization(string institutionName, string rorDisplayName)
    {
        if (string.IsNullOrWhiteSpace(rorDisplayName))
            return false;

        var a = Tokenize(institutionName);
        var b = Tokenize(rorDisplayName);

        return a.Overlaps(b);
    }

    private async Task ReclassifyDomainAsync(
        InstitutionDomain domainRow,
        RorSearchResult correctMatch,
        CancellationToken cancellationToken
    )
    {
        var correctInstitution = await _institutionRepository.FirstOrDefaultAsync(
            x => x.RorId == correctMatch.Organization.Id,
            cancellationToken
        );

        if (correctInstitution == null)
        {
            var displayName =
                correctMatch
                    .Organization.Names.FirstOrDefault(n => n.Types.Contains("ror_display"))
                    ?.Value
                ?? correctMatch.Organization.Names.FirstOrDefault()?.Value
                ?? "Unknown";

            correctInstitution = new Institution
            {
                Id = Guid.NewGuid(),
                Name = displayName,
                Country = correctMatch
                    .Organization.Locations?.FirstOrDefault()
                    ?.GeonamesDetails?.CountryName,
                AlphaTwoCode = correctMatch
                    .Organization.Locations?.FirstOrDefault()
                    ?.GeonamesDetails?.CountryCode,
                RorId = correctMatch.Organization.Id,
                ResolutionMethod = correctMatch.Method,
                RorLookupAttemptedAt = DateTime.UtcNow,
                SyncedAt = DateTime.UtcNow,
            };
            await _institutionRepository.AddAsync(correctInstitution, cancellationToken);
        }

        domainRow.InstitutionId = correctInstitution.Id;

        await _context.CompleteAsync(cancellationToken);
    }

    private static HashSet<string> Tokenize(string s) =>
        s.ToLowerInvariant()
            .Split(new[] { ' ', ',', '.', '-', '(', ')' }, StringSplitOptions.RemoveEmptyEntries)
            .Where(t => t.Length > 2)
            .ToHashSet();
}
