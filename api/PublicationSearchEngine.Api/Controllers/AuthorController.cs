using Microsoft.AspNetCore.Mvc;
using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Application.Services;
using PublicationSearchEngine.Application.Shared.Keys;
using PublicationSearchEngine.Application.Shared.Result;

namespace PublicationSearchEngine.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthorsController : ControllerBase
    {
        private readonly OpenAlexService _openAlexService;
        private readonly InstitutionResolutionService _institutionResolutionService;

        public AuthorsController(
            OpenAlexService openAlexService,
            InstitutionResolutionService institutionResolutionService
        )
        {
            _openAlexService = openAlexService;
            _institutionResolutionService = institutionResolutionService;
        }

        [HttpGet("candidates")]
        public async Task<IActionResult> GetCandidates(
            [FromQuery] string name,
            [FromQuery] string? email,
            CancellationToken ct
        )
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest(
                    new
                    {
                        error = "name is required.",
                        detail = "An email domain alone only identifies an institution, not a specific person.",
                    }
                );
            }

            string? openAlexInstitutionId = null;
            string? resolvedInstitutionName = null;

            if (!string.IsNullOrWhiteSpace(email) && email.Contains('@'))
            {
                var domain = email.Split('@').Last();

                var institution = await _institutionResolutionService.ResolveByEmailDomainAsync(
                    domain,
                    ct
                );

                if (institution?.RorId != null)
                {
                    resolvedInstitutionName = institution.Name;
                    var oaInstitution = await _openAlexService.GetInstitutionByRorAsync(
                        institution.RorId,
                        ct
                    );
                    openAlexInstitutionId = oaInstitution?.Id?.Replace("https://openalex.org/", "");
                }
            }

            var candidates = await _openAlexService.FindAuthorCandidatesAsync(
                name,
                openAlexInstitutionId,
                ct
            );

            return Ok(new { resolvedInstitution = resolvedInstitutionName, candidates });
        }

        [HttpGet("get-all-works-by-author-id")]
        public async Task<Result<PagedResultDto<OpenAlexWork>>> GetAllWorksByOpenAlexAuthorId(
            [FromQuery] OpenAlexAuthorWorksSearchDto request,
            CancellationToken cancellationToken
        )
        {
            var works = await _openAlexService.GetWorksPageFilteredByAuthorAsync(
                request,
                cancellationToken
            );
            return works;
        }

        [HttpGet("get-all-works-by-orcid")]
        public async Task<Result<PagedResultDto<OpenAlexWork>>> GetAllWorksByOrcid(
            [FromQuery] OpenAlexOrcidModeSearchDto request,
            CancellationToken cancellationToken
        )
        {
            var works = await _openAlexService.GetWorksPageFilteredByOrcidAsync(
                request,
                cancellationToken
            );
            return works;
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

        [HttpGet("get-latest-works")]
        public async Task<
            Result<PagedResultDto<OpenAlexWork>>
        > GetLatestWorksPageByOpenAlexAuthorId(
            [FromQuery] OpenAlexAuthorWorksSearchDto request,
            CancellationToken cancellationToken
        )
        {
            request.OrderBy = OpenAlexEntityAttributesKeys.PublicationDate;
            request.IsDescending = true;

            return await _openAlexService.GetWorksPageFilteredByAuthorAsync(
                request,
                cancellationToken
            );
        }

        [HttpGet("get-highest-cited-works")]
        public async Task<
            Result<PagedResultDto<OpenAlexWork>>
        > GetHighestCitedWorksPageByOpenAlexAuthorId(
            [FromQuery] OpenAlexAuthorWorksSearchDto request,
            CancellationToken cancellationToken
        )
        {
            request.OrderBy = OpenAlexEntityAttributesKeys.CitedByCount;
            request.IsDescending = true;

            return await _openAlexService.GetWorksPageFilteredByAuthorAsync(
                request,
                cancellationToken
            );
        }
    }
}
