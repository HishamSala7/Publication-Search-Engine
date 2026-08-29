using System.Net.Http.Json;
using Microsoft.Extensions.Options;
using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Application.Services;

public class HipoDomainSyncService
{
    private readonly HttpClient _httpClient;
    private readonly IApplicationDbContext _context;
    private readonly IInstitutionRepository _institutionRepository;
    private readonly IInstitutionDomainRepository _institutionDomainRepository;
    private readonly HipoRequestConfiguration _hipoRequestConfiguration;

    public HipoDomainSyncService(
        HttpClient httpClient,
        IOptions<HipoRequestConfiguration> options,
        IApplicationDbContext context,
        IInstitutionRepository institutionRepository,
        IInstitutionDomainRepository institutionDomainRepository
    )
    {
        _httpClient = httpClient;
        _context = context;
        _institutionRepository = institutionRepository;
        _institutionDomainRepository = institutionDomainRepository;
        _hipoRequestConfiguration = options.Value;
    }

    public async Task<int> SyncAsync(CancellationToken cancellationToken)
    {
        var data =
            await _httpClient.GetFromJsonAsync<List<HipoDomainSyncResponseDto>>(
                _hipoRequestConfiguration.BaseUrl,
                cancellationToken
            ) ?? [];

        var institutions = await _institutionRepository.GetAllAsync(cancellationToken);

        var existingInstitutions = institutions.ToDictionary(
            i => i.Name.Trim().ToLowerInvariant(),
            i => i
        );

        var existingDomains = (await _institutionDomainRepository.GetAllAsync(cancellationToken))
            .Select(x => x.Domain)
            .ToHashSet();

        var newInstitutions = new List<Institution>();
        var newDomainRows = new List<InstitutionDomain>();
        var domainsSeenThisRun = new HashSet<string>(); // guards duplicate domains within the same payload

        foreach (var item in data)
        {
            var nameKey = item.Name.Trim().ToLowerInvariant();

            if (!existingInstitutions.TryGetValue(nameKey, out var institution))
            {
                institution = new Institution
                {
                    Name = item.Name,
                    Country = item.Country,
                    AlphaTwoCode = item.AlphaTwoCode,
                    SyncedAt = DateTime.UtcNow,
                };
                existingInstitutions[nameKey] = institution;
                newInstitutions.Add(institution);
            }
            else
            {
                institution.Country ??= item.Country;
                institution.AlphaTwoCode ??= item.AlphaTwoCode;
                institution.SyncedAt = DateTime.UtcNow;
            }

            foreach (var domain in item.Domains)
            {
                var normalizedDomain = domain.Trim().ToLowerInvariant();
                if (string.IsNullOrWhiteSpace(normalizedDomain))
                    continue;
                if (existingDomains.Contains(normalizedDomain))
                    continue;
                if (!domainsSeenThisRun.Add(normalizedDomain))
                    continue;

                newDomainRows.Add(
                    new InstitutionDomain
                    {
                        Domain = normalizedDomain,
                        InstitutionId = institution.Id,
                        Institution = institution,
                    }
                );
            }
        }

        if (newInstitutions.Count > 0)
            await _institutionRepository.AddRangeAsync(newInstitutions, cancellationToken);

        if (newDomainRows.Count > 0)
            await _institutionDomainRepository.AddRangeAsync(newDomainRows, cancellationToken);

        await _context.CompleteAsync(cancellationToken);

        return newDomainRows.Count;
    }
}
