using Microsoft.AspNetCore.Mvc;
using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Application.Services;
using PublicationSearchEngine.Application.Shared;

namespace PublicationSearchEngine.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SearchEngineDropDownsController : ControllerBase
{
    private readonly SearchEngineDropDownsService _searchEngineDropDownsService;

    public SearchEngineDropDownsController(
        SearchEngineDropDownsService searchEngineDropDownsService
    )
    {
        _searchEngineDropDownsService = searchEngineDropDownsService;
    }

    [HttpGet("countries-drop-down")]
    public virtual async Task<
        Result<PagedResultDto<SearchEngineDropDownCountryDto>>
    > GetCountriesAsync(
        [FromQuery] SearchEngineDropDownCountrySearchDto request,
        CancellationToken cancellationToken
    )
    {
        return await _searchEngineDropDownsService.GetCountriesAsync(request, cancellationToken);
    }

    [HttpGet("fields-drop-down")]
    public virtual async Task<Result<PagedResultDto<SearchEngineDropDownFieldDto>>> GetFieldsAsync(
        [FromQuery] SearchEngineDropDownFieldSearchDto request,
        CancellationToken cancellationToken
    )
    {
        return await _searchEngineDropDownsService.GetFieldsAsync(request, cancellationToken);
    }

    [HttpGet("subfields-drop-down")]
    public virtual async Task<
        Result<PagedResultDto<SearchEngineDropDownSubFieldDto>>
    > GetSubFieldsAsync(
        [FromQuery] SearchEngineDropDownSubFieldSearchDto request,
        CancellationToken cancellationToken
    )
    {
        return await _searchEngineDropDownsService.GetSubFieldsAsync(request, cancellationToken);
    }

    [HttpGet("topics-drop-down")]
    public virtual async Task<Result<PagedResultDto<SearchEngineDropDownTopicDto>>> GetTopicsAsync(
        [FromQuery] SearchEngineDropDownTopicSearchDto request,
        CancellationToken cancellationToken
    )
    {
        return await _searchEngineDropDownsService.GetTopicsAsync(request, cancellationToken);
    }

    [HttpGet("keywords-drop-down")]
    public virtual async Task<
        Result<PagedResultDto<SearchEngineDropDownKeywordDto>>
    > GetKeywordsAsync(
        [FromQuery] SearchEngineDropDownKeywordSearchDto request,
        CancellationToken cancellationToken
    )
    {
        return await _searchEngineDropDownsService.GetKeywordsAsync(request, cancellationToken);
    }
}
