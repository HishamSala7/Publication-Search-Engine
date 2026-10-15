using Microsoft.AspNetCore.Mvc;
using PublicationSearchEngine.Application.Services;
using PublicationSearchEngine.Application.Shared.Keys;
using PublicationSearchEngine.Application.Shared.Result;

namespace PublicationSearchEngine.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SyncDataController : ControllerBase
    {
        private readonly HipoDomainSyncService _hipoDomainSyncService;
        private readonly OpenAlexSyncService _openAlexSyncService;

        public SyncDataController(
            HipoDomainSyncService hipoDomainSyncService,
            OpenAlexSyncService openAlexSyncService
        )
        {
            _hipoDomainSyncService = hipoDomainSyncService;
            _openAlexSyncService = openAlexSyncService;
        }

        [HttpPost("sync-domains")]
        public async Task<Result> SyncDomains(CancellationToken cancellationToken)
        {
            var count = await _hipoDomainSyncService.SyncAsync(cancellationToken);
            return ResultHandler.Success(new { rowsSynced = count }, ResponseKeys.Success);
        }

        [HttpPost("sync-countries")]
        public async Task<Result> SyncCountriesAsync(CancellationToken cancellationToken)
        {
            await _openAlexSyncService.SyncCountriesAsync(cancellationToken);
            return ResultHandler.Success(ResponseKeys.Success);
        }

        [HttpPost("sync-fields")]
        public async Task<Result> SyncFieldsAsync(CancellationToken cancellationToken)
        {
            await _openAlexSyncService.SyncFieldsAsync(cancellationToken);
            return ResultHandler.Success(ResponseKeys.Success);
        }

        [HttpPost("sync-subFields")]
        public async Task<Result> SyncSubFieldsAsync(CancellationToken cancellationToken)
        {
            await _openAlexSyncService.SyncSubfieldsAsync(cancellationToken);
            return ResultHandler.Success(ResponseKeys.Success);
        }

        [HttpPost("sync-keywords")]
        public async Task<Result> SyncKeywordsAsync(CancellationToken cancellationToken)
        {
            await _openAlexSyncService.SyncKeywordsAsync(cancellationToken);
            return ResultHandler.Success(ResponseKeys.Success);
        }

        [HttpPost("sync-topics")]
        public async Task<Result> SyncTopicsAsync(CancellationToken cancellationToken)
        {
            await _openAlexSyncService.SyncTopicsAsync(cancellationToken);
            return ResultHandler.Success(ResponseKeys.Success);
        }

        [HttpPost("sync-work-types")]
        public async Task<Result> SyncWorkTypesAsync(CancellationToken cancellationToken)
        {
            await _openAlexSyncService.SyncWorkTypesAsync(cancellationToken);
            return ResultHandler.Success(ResponseKeys.Success);
        }

        [HttpPost("sync-open-alex-institutions")]
        public async Task<Result> SyncOpenAlexInstitutionsAsync(CancellationToken cancellationToken)
        {
            await _openAlexSyncService.SyncOpenAlexInstitutionsAsync(cancellationToken);
            return ResultHandler.Success(ResponseKeys.Success);
        }
    }
}
