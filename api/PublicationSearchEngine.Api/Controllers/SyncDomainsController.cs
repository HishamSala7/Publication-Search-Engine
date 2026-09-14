using Microsoft.AspNetCore.Mvc;
using PublicationSearchEngine.Application.Services;

namespace PublicationSearchEngine.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SyncDomainsController : ControllerBase
    {
        private readonly HipoDomainSyncService _hipoDomainSyncService;
        private readonly OpenAlexSyncService _openAlexSyncService;

        public SyncDomainsController(
            HipoDomainSyncService hipoDomainSyncService,
            OpenAlexSyncService openAlexSyncService
        )
        {
            _hipoDomainSyncService = hipoDomainSyncService;
            _openAlexSyncService = openAlexSyncService;
        }

        [HttpPost("sync-domains")]
        public async Task<IActionResult> SyncDomains(CancellationToken cancellationToken)
        {
            var count = await _hipoDomainSyncService.SyncAsync(cancellationToken);
            return Ok(new { rowsSynced = count });
        }

        [HttpPost("sync-countries")]
        public async Task<IActionResult> SyncCountriesAsync(CancellationToken cancellationToken)
        {
            await _openAlexSyncService.SyncCountriesAsync(cancellationToken);
            return Ok();
        }

        [HttpPost("sync-fields")]
        public async Task<IActionResult> SyncFieldsAsync(CancellationToken cancellationToken)
        {
            await _openAlexSyncService.SyncFieldsAsync(cancellationToken);
            return Ok();
        }

        [HttpPost("sync-subFields")]
        public async Task<IActionResult> SyncSubFieldsAsync(CancellationToken cancellationToken)
        {
            await _openAlexSyncService.SyncSubfieldsAsync(cancellationToken);
            return Ok();
        }

        [HttpPost("sync-topics")]
        public async Task<IActionResult> SyncTopicsAsync(CancellationToken cancellationToken)
        {
            await _openAlexSyncService.SyncTopicsAsync(cancellationToken);
            return Ok();
        }
    }
}
