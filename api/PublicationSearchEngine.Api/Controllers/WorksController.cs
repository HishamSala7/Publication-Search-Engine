using Microsoft.AspNetCore.Mvc;
using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Application.Services;
using PublicationSearchEngine.Application.Shared.Keys;
using PublicationSearchEngine.Application.Shared.Result;

namespace PublicationSearchEngine.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class WorksController : ControllerBase
{
    private readonly OpenAlexService _openAlexService;

    public WorksController(OpenAlexService openAlexService)
    {
        _openAlexService = openAlexService;
    }

    [HttpGet("get-work-by-doi")]
    public async Task<Result<OpenAlexWork>> GetWorkByDoi(
        [FromQuery] string doi,
        CancellationToken cancellationToken
    )
    {
        var work = await _openAlexService.GetWorkByDoiAsync(doi, cancellationToken);
        return work;
    }

    [HttpGet("search-works")]
    public async Task<Result<PagedResultDto<OpenAlexWork>>> SearchWorks(
        [FromQuery] OpenAlexWorksSearchDto request,
        CancellationToken cancellationToken
    )
    {
        return await _openAlexService.SearchWorksAsync(request, cancellationToken);
    }

    [HttpGet("get-latest-works")]
    public async Task<Result<PagedResultDto<OpenAlexWork>>> GetLatestWorks(
        [FromQuery] OpenAlexWorksSearchDto request,
        CancellationToken cancellationToken
    )
    {
        request.OrderBy = OpenAlexWorkAttributesKeys.PublicationDate;

        request.IsDescending = true;

        return await _openAlexService.SearchWorksAsync(request, cancellationToken);
    }

    [HttpGet("get-highest-cited-works")]
    public async Task<Result<PagedResultDto<OpenAlexWork>>> GetHighestCitedWorks(
        [FromQuery] OpenAlexWorksSearchDto request,
        CancellationToken cancellationToken
    )
    {
        request.OrderBy = OpenAlexWorkAttributesKeys.CitedByCount;

        request.IsDescending = true;

        return await _openAlexService.SearchWorksAsync(request, cancellationToken);
    }

    [HttpGet("search-works-by-orcid")]
    public async Task<Result<PagedResultDto<OpenAlexWork>>> SearchByOrcid(
        [FromQuery] OpenAlexWorksSearchDto request,
        CancellationToken cancellationToken
    )
    {
        return await _openAlexService.SearchWorksAsync(request, cancellationToken);
    }

    [HttpGet("get-institutions-graph")]
    public async Task<Result<List<OpenAlexInstitutionMainGraphDto>>> GetInstitutionGraphAsync(
        [FromQuery] OpenAlexWorksGroupedByFieldsSearchDto request,
        CancellationToken cancellationToken
    )
    {
        return await _openAlexService.GetInstitutionGraphAsync(request, cancellationToken);
    }

    [HttpGet("get-authors-graph")]
    public async Task<Result<List<OpenAlexAuthorGraphDto>>> GetAuthorsGraphAsync(
        [FromQuery] OpenAlexAuthorsGraphSearchDto request,
        CancellationToken cancellationToken
    )
    {
        return await _openAlexService.GetAuthorsGraphAsync(request, cancellationToken);
    }
}
