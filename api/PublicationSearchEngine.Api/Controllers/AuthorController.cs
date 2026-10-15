using Microsoft.AspNetCore.Mvc;
using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Application.Services;
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
            CancellationToken cancellationToken
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
                    cancellationToken
                );

                if (institution?.RorId != null)
                {
                    resolvedInstitutionName = institution.Name;
                    var oaInstitution = await _openAlexService.GetInstitutionByRorAsync(
                        institution.RorId,
                        cancellationToken
                    );
                    openAlexInstitutionId = oaInstitution?.Id?.Replace("https://openalex.org/", "");
                }
            }

            var candidates = await _openAlexService.FindAuthorCandidatesAsync(
                name,
                openAlexInstitutionId,
                cancellationToken
            );

            return Ok(new { resolvedInstitution = resolvedInstitutionName, candidates });
        }

        [HttpGet("author-details")]
        public async Task<Result<OpenAlexAuthorDetail>> GetAuthorDetails(
            [FromQuery] string openAlexAuthorId,
            CancellationToken cancellationToken
        )
        {
            return await _openAlexService.GetAuthorDetailByIdAsync(
                openAlexAuthorId,
                cancellationToken
            );
        }

        [HttpGet("author-details-by-orcid")]
        public async Task<Result<OpenAlexAuthorDetail>> GetAuthorDetailsByOrcid(
            [FromQuery] string orcid,
            CancellationToken cancellationToken
        )
        {
            return await _openAlexService.GetAuthorDetailByOrcidAsync(orcid, cancellationToken);
        }

        [HttpGet("get-work-author-position-counts")]
        public async Task<Result<AuthorPositionCountDto>> GetWorkAuthorPositionCountsAsync(
            string openAlexAuthorId,
            CancellationToken cancellationToken
        )
        {
            return await _openAlexService.GetAuthorPositionCountAsync(
                openAlexAuthorId,
                cancellationToken
            );
        }
    }
}
