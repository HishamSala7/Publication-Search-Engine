using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Application.Shared.Keys;
using PublicationSearchEngine.Application.Shared.Result;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Application.Services;

public class SearchEngineDropDownsService
{
    private readonly ICountryRepository _countryRepository;
    private readonly IFieldRepository _fieldRepository;
    private readonly ISubFieldRepository _subFieldRepository;
    private readonly ITopicRepository _topicRepository;
    private readonly IKeywordRepository _keywordRepository;

    public SearchEngineDropDownsService(
        ICountryRepository countryRepository,
        IFieldRepository fieldRepository,
        ISubFieldRepository subFieldRepository,
        ITopicRepository topicRepository,
        IKeywordRepository keywordRepository
    )
    {
        _countryRepository = countryRepository;
        _fieldRepository = fieldRepository;
        _subFieldRepository = subFieldRepository;
        _topicRepository = topicRepository;
        _keywordRepository = keywordRepository;
    }

    public virtual async Task<
        Result<PagedResultDto<SearchEngineDropDownCountryDto>>
    > GetCountriesAsync(
        SearchEngineDropDownCountrySearchDto request,
        CancellationToken cancellationToken
    )
    {
        (List<Country> entities, long totalCount) =
            await _countryRepository.SearchWithPaginationAsync(
                request.Take,
                request.Skip,
                request.Filter,
                cancellationToken
            );

        var dtos = entities
            .Select(x => new SearchEngineDropDownCountryDto
            {
                Id = x.Id,
                OpenAlexId = x.OpenAlexId,
                Continent = x.Continent,
                DisplayName = x.DisplayName,
            })
            .ToList();

        var result = new PagedResultDto<SearchEngineDropDownCountryDto>
        {
            TotalCount = totalCount,
            Items = dtos,
        };

        return totalCount > 0
            ? ResultHandler.Success(result, ResponseKeys.Success)
            : ResultHandler.NoContent<PagedResultDto<SearchEngineDropDownCountryDto>>(
                ResponseKeys.NoContent
            );
    }

    public virtual async Task<Result<PagedResultDto<SearchEngineDropDownFieldDto>>> GetFieldsAsync(
        SearchEngineDropDownFieldSearchDto request,
        CancellationToken cancellationToken
    )
    {
        (List<Field> entities, long totalCount) = await _fieldRepository.SearchWithPaginationAsync(
            request.Take,
            request.Skip,
            request.Filter,
            cancellationToken
        );

        var dtos = entities
            .Select(x => new SearchEngineDropDownFieldDto
            {
                Id = x.Id,
                OpenAlexId = x.OpenAlexId,
                DisplayName = x.DisplayName,
            })
            .ToList();

        var result = new PagedResultDto<SearchEngineDropDownFieldDto>
        {
            TotalCount = totalCount,
            Items = dtos,
        };

        return totalCount > 0
            ? ResultHandler.Success(result, ResponseKeys.Success)
            : ResultHandler.NoContent<PagedResultDto<SearchEngineDropDownFieldDto>>(
                ResponseKeys.NoContent
            );
    }

    public virtual async Task<
        Result<PagedResultDto<SearchEngineDropDownSubFieldDto>>
    > GetSubFieldsAsync(
        SearchEngineDropDownSubFieldSearchDto request,
        CancellationToken cancellationToken
    )
    {
        (List<SubField> entities, long totalCount) =
            await _subFieldRepository.SearchWithPaginationAsync(
                request.FieldIds,
                request.Take,
                request.Skip,
                request.Filter,
                cancellationToken
            );

        var dtos = entities
            .Select(x => new SearchEngineDropDownSubFieldDto
            {
                Id = x.Id,
                OpenAlexId = x.OpenAlexId,
                DisplayName = x.DisplayName,
            })
            .ToList();

        var result = new PagedResultDto<SearchEngineDropDownSubFieldDto>
        {
            TotalCount = totalCount,
            Items = dtos,
        };

        return totalCount > 0
            ? ResultHandler.Success(result, ResponseKeys.Success)
            : ResultHandler.NoContent<PagedResultDto<SearchEngineDropDownSubFieldDto>>(
                ResponseKeys.NoContent
            );
    }

    public virtual async Task<Result<PagedResultDto<SearchEngineDropDownTopicDto>>> GetTopicsAsync(
        SearchEngineDropDownTopicSearchDto request,
        CancellationToken cancellationToken
    )
    {
        (List<Topic> entities, long totalCount) = await _topicRepository.SearchWithPaginationAsync(
            request.FieldIds,
            request.SubFieldIds,
            request.Take,
            request.Skip,
            request.Filter,
            cancellationToken
        );

        var dtos = entities
            .Select(x => new SearchEngineDropDownTopicDto
            {
                Id = x.Id,
                OpenAlexId = x.OpenAlexId,
                DisplayName = x.DisplayName,
            })
            .ToList();

        var result = new PagedResultDto<SearchEngineDropDownTopicDto>
        {
            TotalCount = totalCount,
            Items = dtos,
        };

        return totalCount > 0
            ? ResultHandler.Success(result, ResponseKeys.Success)
            : ResultHandler.NoContent<PagedResultDto<SearchEngineDropDownTopicDto>>(
                ResponseKeys.NoContent
            );
    }

    public virtual async Task<
        Result<PagedResultDto<SearchEngineDropDownKeywordDto>>
    > GetKeywordsAsync(
        SearchEngineDropDownKeywordSearchDto request,
        CancellationToken cancellationToken
    )
    {
        (List<Keyword> entities, long totalCount) =
            await _keywordRepository.SearchWithPaginationAsync(
                request.FieldIds,
                request.SubFieldIds,
                request.TopicIds,
                request.Take,
                request.Skip,
                request.Filter,
                cancellationToken
            );

        var dtos = entities
            .Select(x => new SearchEngineDropDownKeywordDto
            {
                Id = x.Id,
                OpenAlexId = x.OpenAlexId,
                DisplayName = x.DisplayName,
            })
            .ToList();

        var result = new PagedResultDto<SearchEngineDropDownKeywordDto>
        {
            TotalCount = totalCount,
            Items = dtos,
        };

        return totalCount > 0
            ? ResultHandler.Success(result, ResponseKeys.Success)
            : ResultHandler.NoContent<PagedResultDto<SearchEngineDropDownKeywordDto>>(
                ResponseKeys.NoContent
            );
    }
}
