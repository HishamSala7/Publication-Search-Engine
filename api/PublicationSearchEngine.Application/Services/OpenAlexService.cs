using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Application.Interfaces;
using PublicationSearchEngine.Application.Services.HttpClientServices;
using PublicationSearchEngine.Application.Shared.Builders;
using PublicationSearchEngine.Application.Shared.Consts;
using PublicationSearchEngine.Application.Shared.ExtensionMethods;
using PublicationSearchEngine.Application.Shared.Keys;
using PublicationSearchEngine.Application.Shared.Result;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;
using PublicationSearchEngine.Domain.Shared.Enums;

namespace PublicationSearchEngine.Application.Services;

public class OpenAlexService
{
    private readonly OpenAlexClientService _openAlexClientService;
    private readonly ICacheService _cacheService;
    private readonly ISearchCacheKeyBuilder _cacheKeyBuilder;
    private readonly OpenAlexWorksFilterBuilder _filterBuilder;
    private readonly OpenAlexWorksSortBuilder _sortBuilder;
    private readonly OpenAlexWorksSelectBuilder _selectBuilder;
    private readonly IOpenAlexInstitutionRepository _openAlexInstitutionRepository;
    private readonly OpenAlexResearcherGraphGroupByBuilder _openAlexResearcherGraphGroupByBuilder;

    public OpenAlexService(
        OpenAlexClientService openAlexClientService,
        ICacheService cacheService,
        ISearchCacheKeyBuilder cacheKeyBuilder,
        OpenAlexWorksFilterBuilder filterBuilder,
        OpenAlexWorksSortBuilder sortBuilder,
        OpenAlexWorksSelectBuilder selectBuilder,
        IOpenAlexInstitutionRepository openAlexInstitutionRepository,
        OpenAlexResearcherGraphGroupByBuilder openAlexResearcherGraphGroupByBuilder
    )
    {
        _openAlexClientService = openAlexClientService;
        _cacheService = cacheService;
        _cacheKeyBuilder = cacheKeyBuilder;
        _filterBuilder = filterBuilder;
        _sortBuilder = sortBuilder;
        _selectBuilder = selectBuilder;
        _openAlexInstitutionRepository = openAlexInstitutionRepository;
        _openAlexResearcherGraphGroupByBuilder = openAlexResearcherGraphGroupByBuilder;
    }

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

            cached.Works.AddRange(response.Results);

            cached.CursorMap[cached.Works.Count] = response.Meta.NextCursor;

            cached.TotalCount = response.Meta.Count;

            await _cacheService.SetAsync(cacheKey, cached, OpenAlexConsts.WorksExpiration);
        }

        var result = new PagedResultDto<OpenAlexWork>
        {
            Items = cached.Works.Skip(request.Skip).Take(request.Take).ToList(),

            TotalCount = cached.TotalCount,
        };

        return ResultHandler.Success(result, ResponseKeys.Success);
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
            OpenAlexEntities.Works,
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

    public async Task<OpenAlexInstitutionSimpleDto?> GetInstitutionByRorAsync(
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

        var institution =
            await _openAlexClientService.GetFirstOrDefaultAsync<OpenAlexInstitutionSimpleDto>(
                OpenAlexEntities.Institutions,
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

    public async Task<Result<List<OpenAlexInstitutionMainGraphDto>>> GetInstitutionGraphAsync(
        OpenAlexWorksGroupedByFieldsSearchDto request,
        CancellationToken cancellationToken
    )
    {
        var institutionIds = request.OpenAlexInstitutionIds.NormalizeStringList(x =>
            x.ExtractOpenAlexId()
        );

        if (institutionIds.Count == 0)
            return ResultHandler.BadRequest<List<OpenAlexInstitutionMainGraphDto>>(
                ResponseKeys.BadRequest
            );

        var startDate = request
            .StartDate.ToNullableDateOnly(OpenAlexConsts.DateFormat)
            ?.ToString(OpenAlexConsts.DateFormat);

        var endDate = request
            .EndDate.ToNullableDateOnly(OpenAlexConsts.DateFormat)
            ?.ToString(OpenAlexConsts.DateFormat);

        var fieldIds = request.OpenAlexFieldIds.NormalizeStringList(x =>
            x.ExtractOpenAlexFieldId()
        );

        var types = request.Types.Distinct().Order().ToList();

        var institutions = await _openAlexInstitutionRepository.GetByOpenAlexIdsAsync(
            institutionIds,
            cancellationToken
        );

        var institutionMap = institutions.ToDictionary(
            x => x.OpenAlexId,
            StringComparer.OrdinalIgnoreCase
        );

        var result = new List<OpenAlexInstitutionMainGraphDto>();

        foreach (var institutionId in institutionIds)
        {
            institutionMap.TryGetValue(institutionId, out var institution);

            var graph = await GetInstitutionGraphItemAsync(
                institutionId,
                institution,
                startDate,
                endDate,
                fieldIds,
                types,
                cancellationToken
            );

            result.Add(graph);
        }

        return ResultHandler.Success(result, ResponseKeys.Success);
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
            OpenAlexEntities.Authors,
            OpenAlexConsts.AuthorCandidatesPerPageCount,
            filters,
            null,
            null,
            "*",
            cancellationToken
        );

        var authorDetails = response?.Results ?? [];

        if (authorDetails.Count > 0)
        {
            await CacheOpenAlexAuthorDetailsAsync(authorDetails);
        }

        var candidates = authorDetails
            .Select(author => new AuthorCandidate
            {
                OpenAlexId = author.Id!,
                DisplayName = author.DisplayName!,
                Orcid = author.Orcid,
                Institution = author.LastKnownInstitutions?.FirstOrDefault()?.DisplayName,
                WorksCount = author.WorksCount,
                CitedByCount = author.CitedByCount,
            })
            .ToList();

        if (candidates.Count == 0 && !string.IsNullOrWhiteSpace(institutionId))
        {
            return await FindAuthorCandidatesAsync(name, institutionId: null, cancellationToken);
        }

        return candidates;
    }

    public async Task<Result<OpenAlexAuthorDetail>> GetAuthorDetailByIdAsync(
        string openAlexAuthorId,
        CancellationToken cancellationToken
    )
    {
        var id = openAlexAuthorId.ExtractOpenAlexId();

        if (string.IsNullOrWhiteSpace(id))
        {
            return ResultHandler.NotFound<OpenAlexAuthorDetail>(ResponseKeys.NotFound);
        }

        var cacheKey = OpenAlexAuthorDetailCacheDto.GetCacheKey(id);

        var cached = await _cacheService.GetAsync<OpenAlexAuthorDetailCacheDto>(cacheKey);

        if (cached?.Author != null)
        {
            return ResultHandler.Success(cached.Author);
        }

        var author = await _openAlexClientService.GetByIdAsync<OpenAlexAuthorDetail>(
            OpenAlexEntities.Authors,
            id,
            null,
            cancellationToken
        );

        if (author == null)
        {
            return ResultHandler.NotFound<OpenAlexAuthorDetail>(ResponseKeys.NotFound);
        }

        await CacheOpenAlexAuthorDetailAsync(author);

        return ResultHandler.Success(author);
    }

    public async Task<Result<OpenAlexAuthorDetail>> GetAuthorDetailByOrcidAsync(
        string orcidValue,
        CancellationToken cancellationToken
    )
    {
        var orcid = orcidValue.ExtractOrcid();

        if (string.IsNullOrWhiteSpace(orcid))
            return ResultHandler.NotFound<OpenAlexAuthorDetail>(ResponseKeys.NotFound);

        var cacheKey = OpenAlexOrcidAuthorCacheDto.GetCacheKey(orcid);

        var cached = await _cacheService.GetAsync<OpenAlexOrcidAuthorCacheDto>(cacheKey);

        if (!string.IsNullOrWhiteSpace(cached?.OpenAlexAuthorId))
            return await GetAuthorDetailByIdAsync(cached.OpenAlexAuthorId, cancellationToken);

        var author = await _openAlexClientService.GetFirstOrDefaultAsync<OpenAlexAuthorDetail>(
            OpenAlexEntities.Authors,
            [new OpenAlexFilter { Attribute = "orcid", Value = orcid }],
            null,
            null,
            "*",
            cancellationToken
        );

        if (author == null)
            return ResultHandler.NotFound<OpenAlexAuthorDetail>(ResponseKeys.NotFound);

        await CacheOpenAlexAuthorDetailAsync(author);

        return ResultHandler.Success(author);
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

        var filters = await _filterBuilder.BuildAsync(
            new OpenAlexWorksSearchDto { OpenAlexAuthorId = id },
            cancellationToken
        );

        var select = _selectBuilder.Build(
            new OpenAlexWorksSelectDto { IncludeId = true, IncludeAuthorships = true }
        );

        var works = await _openAlexClientService.GetAllAsync<OpenAlexWork>(
            OpenAlexEntities.Works,
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

    public async Task<Result<List<OpenAlexAuthorGraphDto>>> GetAuthorsGraphAsync(
        OpenAlexAuthorsGraphSearchDto request,
        CancellationToken cancellationToken
    )
    {
        var authorIds = request.OpenAlexAuthorIds.NormalizeStringList(x => x.ExtractOpenAlexId());

        if (authorIds.Count == 0)
            return ResultHandler.BadRequest<List<OpenAlexAuthorGraphDto>>(ResponseKeys.BadRequest);

        var startDate = request
            .StartDate.ToNullableDateOnly(OpenAlexConsts.DateFormat)
            ?.ToString(OpenAlexConsts.DateFormat);

        var endDate = request
            .EndDate.ToNullableDateOnly(OpenAlexConsts.DateFormat)
            ?.ToString(OpenAlexConsts.DateFormat);

        var institutionIds = request.OpenAlexInstitutionIds.NormalizeStringList(x =>
            x.ExtractOpenAlexId()
        );

        var fieldIds = request.OpenAlexFieldIds.NormalizeStringList(x =>
            x.ExtractOpenAlexFieldId()
        );

        var subFieldIds = request.OpenAlexSubFieldIds.NormalizeStringList(x =>
            x.ExtractOpenAlexSubfieldId()
        );

        var types = request.Types.Distinct().Order().ToList();

        var result = new List<OpenAlexAuthorGraphDto>();

        foreach (var authorId in authorIds)
        {
            var graph = await GetAuthorGraphAsync(
                authorId,
                startDate,
                endDate,
                institutionIds,
                fieldIds,
                subFieldIds,
                types,
                request.Mode,
                cancellationToken
            );

            if (graph != null)
                result.Add(graph);
        }

        if (result.Count == 0)
            return ResultHandler.NotFound<List<OpenAlexAuthorGraphDto>>(ResponseKeys.NotFound);

        return ResultHandler.Success(result, ResponseKeys.Success);
    }

    private async Task<OpenAlexResponse<OpenAlexWork>?> LoadFullWorksPageFromOpenAlexAsync(
        OpenAlexWorksSearchDto request,
        string cursor,
        CancellationToken cancellationToken
    )
    {
        var filters = await _filterBuilder.BuildAsync(request, cancellationToken);

        var sort = _sortBuilder.Build(request);

        return await _openAlexClientService.GetPageAsync<OpenAlexWork>(
            OpenAlexEntities.Works,
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
            OpenAlexEntities.Authors,
            [new OpenAlexFilter { Attribute = "orcid", Value = orcid }],
            null,
            null,
            "*",
            cancellationToken
        );

        if (author == null)
            return null;

        var authorId = author.Id.ExtractOpenAlexId();

        if (string.IsNullOrWhiteSpace(authorId))
            return null;

        await CacheOpenAlexAuthorDetailAsync(author);

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
            OpenAlexAuthorId = request.OpenAlexAuthorId.ExtractOpenAlexId(),

            FieldIds = request.OpenAlexFieldIds.NormalizeStringList(x =>
                x.ExtractOpenAlexFieldId()
            ),

            SubFieldIds = request.OpenAlexSubFieldIds.NormalizeStringList(x =>
                x.ExtractOpenAlexSubfieldId()
            ),

            TopicIds = request.OpenAlexTopicIds.NormalizeStringList(x =>
                x.ExtractOpenAlexTopicId()
            ),

            KeywordIds = request.OpenAlexKeywordIds.NormalizeStringList(x =>
                x.ExtractOpenAlexKeywordId()
            ),

            InstitutionIds = request.OpenAlexInstitutionIds.NormalizeStringList(x =>
                x.ExtractOpenAlexId()
            ),

            Types = request.Types.Distinct().Order().ToList(),

            OrderBy = request.OrderBy,

            IsDescending = request.IsDescending,

            StartDate = startDate,

            EndDate = endDate,
        };
    }

    private async Task CacheOpenAlexAuthorDetailAsync(OpenAlexAuthorDetail author)
    {
        var openAlexAuthorId = author.Id.ExtractOpenAlexId();

        if (string.IsNullOrWhiteSpace(openAlexAuthorId))
            return;

        var tasks = new List<Task>
        {
            _cacheService.SetAsync(
                OpenAlexAuthorDetailCacheDto.GetCacheKey(openAlexAuthorId),
                new OpenAlexAuthorDetailCacheDto { Author = author },
                OpenAlexConsts.AuthorDetailExpiration
            ),
        };

        var orcid = author.Orcid.ExtractOrcid();

        if (!string.IsNullOrWhiteSpace(orcid))
        {
            tasks.Add(
                _cacheService.SetAsync(
                    OpenAlexOrcidAuthorCacheDto.GetCacheKey(orcid),
                    new OpenAlexOrcidAuthorCacheDto { OpenAlexAuthorId = openAlexAuthorId },
                    OpenAlexConsts.AuthorOrcidExpiration
                )
            );
        }

        await Task.WhenAll(tasks);
    }

    private async Task CacheOpenAlexAuthorDetailsAsync(IEnumerable<OpenAlexAuthorDetail> authors)
    {
        await Task.WhenAll(authors.Select(CacheOpenAlexAuthorDetailAsync));
    }

    private async Task<OpenAlexInstitutionMainGraphDto> GetInstitutionGraphItemAsync(
        string institutionId,
        OpenAlexInstitution? institution,
        string? startDate,
        string? endDate,
        List<string> fieldIds,
        List<PublicationType> types,
        CancellationToken cancellationToken
    )
    {
        var cacheKeyDto = new OpenAlexInstitutionGraphCacheKeyDto
        {
            OpenAlexInstitutionId = institutionId,
            StartDate = startDate,
            EndDate = endDate,
            FieldIds = fieldIds,
            Types = types,
        };

        var cacheKey = _cacheKeyBuilder.Build("openalex:institution-field-graph", cacheKeyDto);

        var cached = await _cacheService.GetAsync<OpenAlexInstitutionMainGraphDto>(cacheKey);

        if (cached != null)
            return cached;

        var searchRequest = new OpenAlexWorksSearchDto
        {
            StartDate = startDate,
            EndDate = endDate,
            OpenAlexFieldIds = fieldIds,
            Types = types,
            OpenAlexInstitutionIds = [institutionId],
        };

        var filters = await _filterBuilder.BuildAsync(searchRequest, cancellationToken);

        var groups = await _openAlexClientService.GetAllGroupedAsync(
            OpenAlexEntities.Works,
            OpenAlexWorkAttributesKeys.PrimaryTopicFieldId,
            false,
            filters,
            cancellationToken
        );

        var fields = groups
            .Where(x => !string.IsNullOrWhiteSpace(x.KeyDisplayName))
            .Select(x => new OpenAlexInstitutionFieldsDto
            {
                FieldDisplayName = x.KeyDisplayName!,
                Count = x.Count,
            })
            .ToList();

        var result = new OpenAlexInstitutionMainGraphDto
        {
            Id = institution?.Id ?? Guid.Empty,
            OpenAlexInstitutionId = institutionId,
            InstitutionDisplayName = institution?.DisplayName ?? string.Empty,
            Fields = fields,
        };

        await _cacheService.SetAsync(cacheKey, result, OpenAlexConsts.InstitutionGraphExpiration);

        return result;
    }

    private async Task<OpenAlexAuthorGraphDto?> GetAuthorGraphAsync(
        string authorId,
        string? startDate,
        string? endDate,
        List<string> institutionIds,
        List<string> fieldIds,
        List<string> subFieldIds,
        List<PublicationType> types,
        OpenAlexGraphMode mode,
        CancellationToken cancellationToken
    )
    {
        var authorResult = await GetAuthorDetailByIdAsync(authorId, cancellationToken);

        if (!authorResult.Succeeded || authorResult.Data == null)
            return null;

        var cacheKeyDto = new OpenAlexAuthorGraphCacheKeyDto
        {
            OpenAlexAuthorId = authorId,
            StartDate = startDate,
            EndDate = endDate,
            InstitutionIds = institutionIds,
            FieldIds = fieldIds,
            SubFieldIds = subFieldIds,
            Types = types,
            Mode = mode,
        };

        var cacheKey = _cacheKeyBuilder.Build("openalex:author-graph", cacheKeyDto);

        var cached = await _cacheService.GetAsync<OpenAlexAuthorGroupedGraphCacheDto>(cacheKey);

        if (cached != null)
            return new OpenAlexAuthorGraphDto
            {
                OpenAlexAuthorId = authorId,
                AuthorDisplayName = authorResult.Data.DisplayName ?? string.Empty,
                Mode = mode,
                Items = cached.Items,
            };

        var searchRequest = new OpenAlexWorksSearchDto
        {
            OpenAlexAuthorId = authorId,
            StartDate = startDate,
            EndDate = endDate,

            OpenAlexInstitutionIds = institutionIds,
            OpenAlexFieldIds = fieldIds,
            OpenAlexSubFieldIds = subFieldIds,

            Types = types,
        };

        var filters = await _filterBuilder.BuildAsync(searchRequest, cancellationToken);

        var groupByAttribute = _openAlexResearcherGraphGroupByBuilder.Build(mode);

        var groups = await _openAlexClientService.GetAllGroupedAsync(
            OpenAlexEntities.Works,
            groupByAttribute,
            false,
            filters,
            cancellationToken
        );

        var items = MapAuthorGraphItems(groups, mode);

        await _cacheService.SetAsync(
            cacheKey,
            new OpenAlexAuthorGroupedGraphCacheDto { Items = items },
            OpenAlexConsts.ResearcherGraphExpiration
        );

        return new OpenAlexAuthorGraphDto
        {
            OpenAlexAuthorId = authorId,
            AuthorDisplayName = authorResult.Data.DisplayName ?? string.Empty,
            Mode = mode,
            Items = items,
        };
    }

    private static List<OpenAlexAuthorGraphItemDto> MapAuthorGraphItems(
        List<OpenAlexGroupByItem> groups,
        OpenAlexGraphMode mode
    )
    {
        var items = groups
            .Where(x =>
                !string.IsNullOrWhiteSpace(x.Key) || !string.IsNullOrWhiteSpace(x.KeyDisplayName)
            )
            .Select(x => new OpenAlexAuthorGraphItemDto
            {
                Key = x.Key ?? string.Empty,
                DisplayName = x.KeyDisplayName ?? x.Key ?? string.Empty,
                Count = x.Count,
            });

        if (mode == OpenAlexGraphMode.Year)
            return items
                .OrderBy(x => int.TryParse(x.Key, out var year) ? year : int.MaxValue)
                .ToList();

        return items.ToList();
    }
}
