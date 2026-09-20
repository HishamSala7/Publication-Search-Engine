using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Application.Interfaces;
using PublicationSearchEngine.Application.Services.HttpClientServices;
using PublicationSearchEngine.Application.Shared.Consts;
using PublicationSearchEngine.Application.Shared.ExtensionMethods;
using PublicationSearchEngine.Application.Shared.Keys;
using PublicationSearchEngine.Application.Shared.Result;

namespace PublicationSearchEngine.Application.Services;

public class OpenAlexService
{
    private readonly OpenAlexClientService _openAlexClientService;
    private readonly ICacheService _cacheService;

    public OpenAlexService(OpenAlexClientService openAlexClientService, ICacheService cacheService)
    {
        _openAlexClientService = openAlexClientService;
        _cacheService = cacheService;
    }

    //public async Task<OpenAlexWork?> GetWorkByIdAsync(string workId, CancellationToken ct) =>
    //    await _httpClient.GetFromJsonAsync<OpenAlexWork>($"works/{workId}", ct);


    public async Task<Result<PagedResultDto<OpenAlexWork>>> GetWorksPageFilteredByAuthorAsync(
        OpenAlexAuthorWorksSearchDto request,
        CancellationToken cancellationToken
    )
    {
        var cacheKey = GetAuthorWorksCacheKey(request);

        var cached = await _cacheService.GetAsync<OpenAlexAuthorWorksCacheDto>(cacheKey);

        if (cached == null)
        {
            var response = await LoadFullWorksPageFromOpenAlexAsync(
                request,
                "*",
                cancellationToken
            );

            cached = ToCacheDto(response);

            await _cacheService.SetAsync(cacheKey, cached, TimeSpan.FromHours(1));

            await CacheOpenAlexAuthorIdsByOrcidAsync(cached.Works);
        }

        while (cached.Works.Count < request.Skip + request.Take)
        {
            if (string.IsNullOrWhiteSpace(cached.NextCursor))
                break;

            var nextPage = await LoadFullWorksPageFromOpenAlexAsync(
                request,
                cached.NextCursor,
                cancellationToken
            );

            var cacheDto = ToCacheDto(nextPage);

            if (cacheDto.Works.Count == 0)
                break;

            cached.Works.AddRange(cacheDto.Works);

            cached.NextCursor = cacheDto.NextCursor;

            await _cacheService.SetAsync(cacheKey, cached, TimeSpan.FromHours(1));

            await CacheOpenAlexAuthorIdsByOrcidAsync(cacheDto.Works);
        }

        var result = new PagedResultDto<OpenAlexWork>
        {
            Items = cached.Works.Skip(request.Skip).Take(request.Take).ToList(),

            TotalCount = cached.TotalCount,
        };

        return ResultHandler.Success(result, ResponseKeys.Success);
    }

    public async Task<Result<PagedResultDto<OpenAlexWork>>> GetWorksPageFilteredByOrcidAsync(
        OpenAlexOrcidModeSearchDto request,
        CancellationToken cancellationToken
    )
    {
        var orcid = request.Orcid.ExtractOrcid();

        if (string.IsNullOrWhiteSpace(orcid))
        {
            return ResultHandler.NotFound<PagedResultDto<OpenAlexWork>>(ResponseKeys.NotFound);
        }

        var cacheKey = OpenAlexOrcidAuthorCacheDto.GetCacheKey(orcid);

        var cacheDto = await _cacheService.GetAsync<OpenAlexOrcidAuthorCacheDto>(cacheKey);

        var openAlexAuthorId = cacheDto?.OpenAlexAuthorId;

        if (string.IsNullOrWhiteSpace(openAlexAuthorId))
        {
            var author = await _openAlexClientService.GetFirstOrDefaultAsync<OpenAlexAuthorDetail>(
                OpenAlexEntityKeys.Authors,
                [("orcid", orcid)],
                null,
                "*",
                cancellationToken
            );

            openAlexAuthorId = author?.Id.ExtractOpenAlexId();

            if (string.IsNullOrWhiteSpace(openAlexAuthorId))
            {
                return ResultHandler.NotFound<PagedResultDto<OpenAlexWork>>(ResponseKeys.NotFound);
            }

            cacheDto = new OpenAlexOrcidAuthorCacheDto { OpenAlexAuthorId = openAlexAuthorId };

            await _cacheService.SetAsync(cacheKey, cacheDto, TimeSpan.FromHours(1));
        }

        return await GetWorksPageFilteredByAuthorAsync(
            new OpenAlexAuthorWorksSearchDto
            {
                OpenAlexAuthorId = openAlexAuthorId,
                Skip = request.Skip,
                Take = request.Take,
            },
            cancellationToken
        );
    }

    public async Task<Result<OpenAlexWork>> GetWorkByDoiAsync(
        string doi,
        CancellationToken cancellationToken
    )
    {
        var doiNormalized = doi.ExtractDoi();

        if (string.IsNullOrWhiteSpace(doiNormalized))
            return ResultHandler.NotFound<OpenAlexWork>(ResponseKeys.NotFound);

        var cacheKey = OpenAlexDoiWorkCacheDto.GetCacheKey(doiNormalized);

        var cached = await _cacheService.GetAsync<OpenAlexDoiWorkCacheDto>(cacheKey);

        if (cached?.Work != null)
            return ResultHandler.Success(cached.Work);

        var work = await _openAlexClientService.GetFirstOrDefaultAsync<OpenAlexWork>(
            OpenAlexEntityKeys.Works,
            [("doi", doiNormalized)],
            null,
            "*",
            cancellationToken
        );

        if (work == null)
            return ResultHandler.NotFound<OpenAlexWork>(ResponseKeys.NotFound);

        await Task.WhenAll(
            CacheOpenAlexWorkByDoiAsync(doiNormalized, work),
            CacheOpenAlexAuthorIdsByOrcidAsync([work])
        );

        return ResultHandler.Success(work);
    }

    public async Task<OpenAlexInstitution?> GetInstitutionByRorAsync(
        string rorId,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(rorId))
            return null;

        var response = await _openAlexClientService.GetFirstOrDefaultAsync<OpenAlexInstitution>(
            OpenAlexEntityKeys.Institutions,
            [("ror", rorId.ExtractRorId())],
            null,
            cancellationToken: cancellationToken
        );

        return response;
    }

    public async Task<List<AuthorCandidate>> FindAuthorCandidatesAsync(
        string name,
        string? institutionId,
        CancellationToken cancellationToken
    )
    {
        var response = await _openAlexClientService.GetPageAsync<OpenAlexAuthorDetail>(
            OpenAlexEntityKeys.Authors,
            OpenAlexConsts.AuthorCandidatesPerPageCount,
            [("display_name.search", name), ("last_known_institutions.lineage", institutionId)],
            null,
            "*",
            cancellationToken
        );

        var candidates =
            response
                ?.Results.Select(a => new AuthorCandidate
                {
                    OpenAlexId = a.Id!,
                    DisplayName = a.DisplayName!,
                    Orcid = a.Orcid,
                    Institution = a.LastKnownInstitutions?.FirstOrDefault()?.DisplayName,
                    WorksCount = a.WorksCount,
                    CitedByCount = a.CitedByCount,
                })
                .ToList() ?? new List<AuthorCandidate>();

        await CacheOpenAlexAuthorIdsByOrcidAsync(candidates);

        if (candidates.Count == 0 && !string.IsNullOrWhiteSpace(institutionId))
        {
            return await FindAuthorCandidatesAsync(name, institutionId: null, cancellationToken);
        }

        return candidates;
    }

    private async Task<OpenAlexResponse<OpenAlexWork>?> LoadFullWorksPageFromOpenAlexAsync(
        OpenAlexAuthorWorksSearchDto request,
        string cursor,
        CancellationToken cancellationToken
    )
    {
        return await _openAlexClientService.GetPageAsync<OpenAlexWork>(
            OpenAlexEntityKeys.Works,
            OpenAlexConsts.PerPageMaxLimit,
            [("author.id", request.OpenAlexAuthorId)],
            [(request.OrderBy, request.IsDescending)],
            cursor,
            cancellationToken
        );
    }

    private OpenAlexAuthorWorksCacheDto ToCacheDto(OpenAlexResponse<OpenAlexWork>? response) =>
        new()
        {
            Works = response?.Results ?? [],
            NextCursor = response?.Meta.NextCursor,
            TotalCount = response?.Meta.Count ?? default,
        };

    private async Task CacheOpenAlexAuthorIdsByOrcidAsync(IEnumerable<OpenAlexWork> works)
    {
        var authors = works
            .Where(x => x.Authorships != null && x.Authorships.Count > 0)
            .SelectMany(x => x.Authorships!)
            .Select(x => new
            {
                OpenAlexAuthorId = x.Author?.Id.ExtractOpenAlexId(),
                Orcid = x.Author?.Orcid.ExtractOrcid(),
            })
            .Where(x => x.OpenAlexAuthorId != null && x.Orcid != null)
            .GroupBy(x => x.Orcid)
            .Select(x => x.First())
            .ToList();

        await Task.WhenAll(
            authors.Select(x =>
                _cacheService.SetAsync(
                    OpenAlexOrcidAuthorCacheDto.GetCacheKey(x.Orcid!),
                    new OpenAlexOrcidAuthorCacheDto { OpenAlexAuthorId = x.OpenAlexAuthorId! },
                    TimeSpan.FromHours(1)
                )
            )
        );
    }

    private async Task CacheOpenAlexAuthorIdsByOrcidAsync(IEnumerable<AuthorCandidate> authors)
    {
        var authorOrcids = authors
            .Select(x => new
            {
                OpenAlexAuthorId = x.OpenAlexId.ExtractOpenAlexId(),
                Orcid = x.Orcid.ExtractOrcid(),
            })
            .Where(x => x.OpenAlexAuthorId != null && x.Orcid != null)
            .GroupBy(x => x.Orcid)
            .Select(x => x.First())
            .ToList();

        await Task.WhenAll(
            authorOrcids.Select(x =>
                _cacheService.SetAsync(
                    OpenAlexOrcidAuthorCacheDto.GetCacheKey(x.Orcid!),
                    new OpenAlexOrcidAuthorCacheDto { OpenAlexAuthorId = x.OpenAlexAuthorId! },
                    TimeSpan.FromHours(1)
                )
            )
        );
    }

    private async Task CacheOpenAlexWorkByDoiAsync(string doi, OpenAlexWork work)
    {
        await _cacheService.SetAsync(
            OpenAlexDoiWorkCacheDto.GetCacheKey(doi),
            new OpenAlexDoiWorkCacheDto { Work = work },
            TimeSpan.FromHours(1)
        );
    }

    private static string GetAuthorWorksCacheKey(OpenAlexAuthorWorksSearchDto request)
    {
        if (request.OrderBy == OpenAlexEntityAttributesKeys.PublicationDate && request.IsDescending)
        {
            return OpenAlexAuthorWorksCacheDto.GetCacheKeySortedByPublicationDate(
                request.OpenAlexAuthorId
            );
        }

        if (request.OrderBy == OpenAlexEntityAttributesKeys.CitedByCount && request.IsDescending)
        {
            return OpenAlexAuthorWorksCacheDto.GetCacheKeySortedByCitationCount(
                request.OpenAlexAuthorId
            );
        }

        return OpenAlexAuthorWorksCacheDto.GetCacheKey(request.OpenAlexAuthorId);
    }
}
