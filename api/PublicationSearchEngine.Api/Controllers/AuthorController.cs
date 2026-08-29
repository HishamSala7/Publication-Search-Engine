using Microsoft.AspNetCore.Mvc;
using PublicationSearchEngine.Application.Services;

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

        [HttpGet("GetAllWorks")]
        public async Task<IActionResult> GetAllWorks(
            [FromQuery] string authorId,
            CancellationToken cancellationToken
        )
        {
            if (string.IsNullOrWhiteSpace(authorId))
                return BadRequest("authorId is required");

            var works = await _openAlexService.GetAllWorksByAuthorAsync(
                authorId,
                cancellationToken
            );
            return Ok(new { count = works.Count, results = works });
        }

        [HttpGet("page")]
        public async Task<IActionResult> GetWorksPage(
            [FromQuery] string? authorId,
            [FromQuery] string? search,
            [FromQuery] string? cursor,
            CancellationToken cancellationToken,
            [FromQuery] int perPage = 25
        )
        {
            var page = await _openAlexService.GetWorksPageAsync(
                authorId,
                search,
                cursor,
                perPage,
                cancellationToken
            );
            return Ok(page);
        }
    }
}
