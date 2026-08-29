using Microsoft.AspNetCore.Mvc;
using PublicationSearchEngine.Application.Services;

namespace PublicationSearchEngine.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SyncDomainsController : ControllerBase
    {
        private readonly HipoDomainSyncService _hipoDomainSyncService;

        public SyncDomainsController(HipoDomainSyncService hipoDomainSyncService)
        {
            _hipoDomainSyncService = hipoDomainSyncService;
        }

        [HttpPost("sync-domains")]
        public async Task<IActionResult> SyncDomains(CancellationToken cancellationToken)
        {
            var count = await _hipoDomainSyncService.SyncAsync(cancellationToken);
            return Ok(new { rowsSynced = count });
        }
    }
}
