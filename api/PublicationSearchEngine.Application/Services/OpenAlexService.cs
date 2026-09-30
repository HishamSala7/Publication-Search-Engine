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
    private readonly ISearchCacheKeyBuilder _cacheKeyBuilder;
    private readonly IOpenAlexWorksFilterBuilder _filterBuilder;
    private readonly IOpenAlexWorksSortBuilder _sortBuilder;
    private readonly IOpenAlexWorksSelectBuilder _selectBuilder;

    public OpenAlexService(
        OpenAlexClientService openAlexClientService,
        ICacheService cacheService,
        ISearchCacheKeyBuilder cacheKeyBuilder,
        IOpenAlexWorksFilterBuilder filterBuilder,
        IOpenAlexWorksSortBuilder sortBuilder,
        IOpenAlexWorksSelectBuilder selectBuilder
    )
    {
        _openAlexClientService = openAlexClientService;
        _cacheService = cacheService;
        _cacheKeyBuilder = cacheKeyBuilder;
        _filterBuilder = filterBuilder;
        _sortBuilder = sortBuilder;
        _selectBuilder = selectBuilder;
    }

    //public async Task<OpenAlexWork?> GetWorkByIdAsync(string workId, CancellationToken ct) =>
    //    await _httpClient.GetFromJsonAsync<OpenAlexWork>($"works/{workId}", ct);


    public async Task<Result<PagedResultDto<OpenAlexWork>>> SearchWorksAsync(
        OpenAlexWorksSearchDto request,
        CancellationToken cancellationToken
    )
    {
        if (!string.IsNullOrWhiteSpace(request.Orcid))
        {
            var authorId = await ResolveOpenAlexAuthorIdByOrcidAsync(
                request.Orcid,
                cancellationToken
            );

            if (string.IsNullOrWhiteSpace(authorId))
                return ResultHandler.NotFound<PagedResultDto<OpenAlexWork>>(ResponseKeys.NotFound);

            request.OpenAlexAuthorId = authorId;
        }

        if (string.IsNullOrWhiteSpace(request.OpenAlexAuthorId))
            return ResultHandler.NotFound<PagedResultDto<OpenAlexWork>>(ResponseKeys.NotFound);

        return await SearchWorksByAuthorAsync(request, cancellationToken);
    }

    private async Task<Result<PagedResultDto<OpenAlexWork>>> SearchWorksByAuthorAsync(
        OpenAlexWorksSearchDto request,
        CancellationToken cancellationToken
    )
    {
        var cacheDto = CreateCacheKeyDto(request);

        var cacheKey = _cacheKeyBuilder.Build("openalex:works", cacheDto);

        var cached = await _cacheService.GetAsync<OpenAlexWorksCacheDto>(cacheKey);

        if (cached == null)
        {
            var response = await LoadFullWorksPageFromOpenAlexAsync(
                request,
                "*",
                cancellationToken
            );

            if (response == null)
            {
                return ResultHandler.Failed<PagedResultDto<OpenAlexWork>>(ResponseKeys.Failed);
            }

            cached = ToCacheDto(response);

            await _cacheService.SetAsync(cacheKey, cached, OpenAlexConsts.WorksExpiration);
        }

        var requiredEnd = request.Skip + request.Take;

        while (cached.Works.Count < requiredEnd)
        {
            var currentCount = cached.Works.Count;

            var cursor = cached.CursorMap.GetValueOrDefault(currentCount);

            if (cursor == null && currentCount > 0)
                break;

            var response = await LoadFullWorksPageFromOpenAlexAsync(
                request,
                cursor ?? "*",
                cancellationToken
            );

            if (response == null || response.Results.Count == 0)
                break;

            AppendWorksToCache(cached, response.Results);

            cached.CursorMap[cached.Works.Count] = response.Meta.NextCursor;

            cached.TotalCount = response.Meta.Count;

            await _cacheService.SetAsync(cacheKey, cached, OpenAlexConsts.WorksExpiration);
        }

        return ResultHandler.Success(MapSearchResult(cached, request), ResponseKeys.Success);
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
            [new OpenAlexFilter { Attribute = "doi", Value = doiNormalized }],
            null,
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
        var normalizedRor = rorId.ExtractRorId();

        if (string.IsNullOrWhiteSpace(normalizedRor))
            return null;

        var cacheKey = OpenAlexRorInstitutionCacheDto.GetCacheKey(normalizedRor);

        var cached = await _cacheService.GetAsync<OpenAlexRorInstitutionCacheDto>(cacheKey);

        if (cached?.Institution != null)
            return cached.Institution;

        var institution = await _openAlexClientService.GetFirstOrDefaultAsync<OpenAlexInstitution>(
            OpenAlexEntityKeys.Institutions,
            [new OpenAlexFilter { Attribute = "ror", Value = normalizedRor }],
            null,
            cancellationToken: cancellationToken
        );

        if (institution == null)
            return null;

        await _cacheService.SetAsync(
            cacheKey,
            new OpenAlexRorInstitutionCacheDto { Institution = institution },
            OpenAlexConsts.InstitutionExpiration
        );

        return institution;
    }

    public async Task<List<AuthorCandidate>> FindAuthorCandidatesAsync(
        string name,
        string? institutionId,
        CancellationToken cancellationToken
    )
    {
        var filters = new List<OpenAlexFilter>
        {
            new() { Attribute = "display_name.search", Value = name },
        };

        if (!string.IsNullOrWhiteSpace(institutionId))
        {
            filters.Add(
                new OpenAlexFilter
                {
                    Attribute = "last_known_institutions.lineage",
                    Value = institutionId,
                }
            );
        }

        var response = await _openAlexClientService.GetPageAsync<OpenAlexAuthorDetail>(
            OpenAlexEntityKeys.Authors,
            OpenAlexConsts.AuthorCandidatesPerPageCount,
            filters,
            null,
            null,
            "*",
            cancellationToken
        );

        var candidates =
            response
                ?.Results?.Select(a => new AuthorCandidate
                {
                    OpenAlexId = a.Id!,
                    DisplayName = a.DisplayName!,
                    Orcid = a.Orcid,
                    Institution = a.LastKnownInstitutions?.FirstOrDefault()?.DisplayName,
                    WorksCount = a.WorksCount,
                    CitedByCount = a.CitedByCount,
                })
                .ToList() ?? [];

        await CacheOpenAlexAuthorIdsByOrcidAsync(candidates);

        if (candidates.Count == 0 && !string.IsNullOrWhiteSpace(institutionId))
        {
            return await FindAuthorCandidatesAsync(name, institutionId: null, cancellationToken);
        }

        return candidates;
    }

    public async Task<Result<AuthorPositionCountDto>> GetAuthorPositionCountAsync(
        string openAlexAuthorId,
        CancellationToken cancellationToken
    )
    {
        var id = openAlexAuthorId.ExtractOpenAlexId();

        if (string.IsNullOrWhiteSpace(id))
            return ResultHandler.NotFound<AuthorPositionCountDto>(ResponseKeys.NotFound);

        var cacheKey = OpenAlexAuthorPositionCountCacheDto.GetCacheKey(id);

        var cached = await _cacheService.GetAsync<AuthorPositionCountDto>(cacheKey);

        if (cached != null)
            return ResultHandler.Success(cached);

        var filters = _filterBuilder.Build(new() { OpenAlexAuthorId = id });

        var select = _selectBuilder.Build(
            new OpenAlexWorksSelectDto { IncludeId = true, IncludeAuthorships = true }
        );

        var works = await _openAlexClientService.GetAllAsync<OpenAlexWork>(
            OpenAlexEntityKeys.Works,
            filters,
            null,
            select,
            cancellationToken
        );

        var result = new AuthorPositionCountDto();

        foreach (var work in works)
        {
            var authorPosition = work
                .Authorships?.FirstOrDefault(x => x.Author?.Id?.ExtractOpenAlexId() == id)
                ?.AuthorPosition;

            if (string.IsNullOrWhiteSpace(authorPosition))
                continue;

            switch (authorPosition.ToLowerInvariant())
            {
                case "first":
                    result.FirstPositionCount++;
                    break;

                case "middle":
                    result.MiddlePositionCount++;
                    break;

                case "last":
                    result.LastPositionCount++;
                    break;
            }
        }

        await _cacheService.SetAsync(cacheKey, result, OpenAlexConsts.AuthorPositionExpiration);

        return ResultHandler.Success(result);
    }

    private async Task<OpenAlexResponse<OpenAlexWork>?> LoadFullWorksPageFromOpenAlexAsync(
        OpenAlexWorksSearchDto request,
        string cursor,
        CancellationToken cancellationToken
    )
    {
        var filters = _filterBuilder.Build(request);

        var sort = _sortBuilder.Build(request);

        return await _openAlexClientService.GetPageAsync<OpenAlexWork>(
            OpenAlexEntityKeys.Works,
            OpenAlexConsts.PerPageMaxLimit,
            filters,
            sort,
            null,
            cursor,
            cancellationToken
        );
    }

    private static OpenAlexWorksCacheDto ToCacheDto(OpenAlexResponse<OpenAlexWork>? response)
    {
        var dto = new OpenAlexWorksCacheDto
        {
            Works = response?.Results ?? [],
            TotalCount = response?.Meta.Count ?? 0,
            CachedAt = DateTime.UtcNow,
        };

        if (!string.IsNullOrWhiteSpace(response?.Meta.NextCursor))
        {
            dto.CursorMap[dto.Works.Count] = response.Meta.NextCursor;
        }

        return dto;
    }

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
            .Where(x =>
                !string.IsNullOrWhiteSpace(x.OpenAlexAuthorId)
                && !string.IsNullOrWhiteSpace(x.Orcid)
            )
            .GroupBy(x => x.Orcid)
            .Select(x => x.First())
            .Select(x => (OpenAlexAuthorId: x.OpenAlexAuthorId!, Orcid: x.Orcid!))
            .ToList();

        await CacheOpenAlexAuthorOrcidMappingsAsync(authors);
    }

    private async Task CacheOpenAlexAuthorIdsByOrcidAsync(IEnumerable<AuthorCandidate> authors)
    {
        var authorOrcids = authors
            .Select(x => new
            {
                OpenAlexAuthorId = x.OpenAlexId.ExtractOpenAlexId(),
                Orcid = x.Orcid.ExtractOrcid(),
            })
            .Where(x =>
                !string.IsNullOrWhiteSpace(x.OpenAlexAuthorId)
                && !string.IsNullOrWhiteSpace(x.Orcid)
            )
            .GroupBy(x => x.Orcid)
            .Select(x => x.First())
            .Select(x => (OpenAlexAuthorId: x.OpenAlexAuthorId!, Orcid: x.Orcid!))
            .ToList();

        await CacheOpenAlexAuthorOrcidMappingsAsync(authorOrcids);
    }

    private async Task CacheOpenAlexWorkByDoiAsync(string doi, OpenAlexWork work)
    {
        var normalizedDoi = doi.ExtractDoi();

        if (string.IsNullOrWhiteSpace(normalizedDoi))
            return;

        await _cacheService.SetAsync(
            OpenAlexDoiWorkCacheDto.GetCacheKey(normalizedDoi),
            new OpenAlexDoiWorkCacheDto { Work = work },
            OpenAlexConsts.DoiWorkExpiration
        );
    }

    private async Task CacheOpenAlexAuthorOrcidMappingsAsync(
        IEnumerable<(string OpenAlexAuthorId, string Orcid)> authors
    )
    {
        var mappings = authors
            .Where(x =>
                !string.IsNullOrWhiteSpace(x.OpenAlexAuthorId)
                && !string.IsNullOrWhiteSpace(x.Orcid)
            )
            .Distinct()
            .ToList();

        if (mappings.Count == 0)
            return;

        await Task.WhenAll(
            mappings.Select(x =>
                _cacheService.SetAsync(
                    OpenAlexOrcidAuthorCacheDto.GetCacheKey(x.Orcid),
                    new OpenAlexOrcidAuthorCacheDto { OpenAlexAuthorId = x.OpenAlexAuthorId },
                    OpenAlexConsts.AuthorOrcidExpiration
                )
            )
        );
    }

    private async Task<string?> ResolveOpenAlexAuthorIdByOrcidAsync(
        string orcidValue,
        CancellationToken cancellationToken
    )
    {
        var orcid = orcidValue.ExtractOrcid();

        if (string.IsNullOrWhiteSpace(orcid))
            return null;

        var cacheKey = OpenAlexOrcidAuthorCacheDto.GetCacheKey(orcid);

        var cached = await _cacheService.GetAsync<OpenAlexOrcidAuthorCacheDto>(cacheKey);

        if (!string.IsNullOrWhiteSpace(cached?.OpenAlexAuthorId))
            return cached.OpenAlexAuthorId;

        var author = await _openAlexClientService.GetFirstOrDefaultAsync<OpenAlexAuthorDetail>(
            OpenAlexEntityKeys.Authors,
            [new OpenAlexFilter { Attribute = "orcid", Value = orcid }],
            null,
            null,
            "*",
            cancellationToken
        );

        var authorId = author?.Id.ExtractOpenAlexId();

        if (string.IsNullOrWhiteSpace(authorId))
            return null;

        await _cacheService.SetAsync(
            cacheKey,
            new OpenAlexOrcidAuthorCacheDto { OpenAlexAuthorId = authorId },
            OpenAlexConsts.AuthorOrcidExpiration
        );

        return authorId;
    }

    private static OpenAlexWorksCacheKeyDto CreateCacheKeyDto(OpenAlexWorksSearchDto request)
    {
        var startDate = request
            .StartDate.ToNullableDateOnly(OpenAlexConsts.DateFormat)
            ?.ToString(OpenAlexConsts.DateFormat);

        var endDate = request
            .EndDate.ToNullableDateOnly(OpenAlexConsts.DateFormat)
            ?.ToString(OpenAlexConsts.DateFormat);

        return new OpenAlexWorksCacheKeyDto
        {
            OpenAlexAuthorId = request.OpenAlexAuthorId,

            FieldIds = request.OpenAlexFieldIds.Order().ToList(),

            SubFieldIds = request.OpenAlexSubFieldIds.Order().ToList(),

            TopicIds = request.OpenAlexTopicIds.Order().ToList(),

            KeywordIds = request.OpenAlexKeywordIds.Order().ToList(),

            OrderBy = request.OrderBy,

            IsDescending = request.IsDescending,

            StartDate = startDate,

            EndDate = endDate,
        };
    }

    private static void AppendWorksToCache(
        OpenAlexWorksCacheDto cache,
        IEnumerable<OpenAlexWork> works
    )
    {
        cache.Works.AddRange(works);
    }

    private static PagedResultDto<OpenAlexWork> MapSearchResult(
        OpenAlexWorksCacheDto cache,
        OpenAlexWorksSearchDto request
    )
    {
        return new PagedResultDto<OpenAlexWork>
        {
            Items = cache.Works.Skip(request.Skip).Take(request.Take).ToList(),

            TotalCount = cache.TotalCount,
        };
    }
}
