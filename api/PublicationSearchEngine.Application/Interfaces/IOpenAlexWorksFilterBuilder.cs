using PublicationSearchEngine.Application.DTOs;

namespace PublicationSearchEngine.Application.Interfaces;

public interface IOpenAlexWorksFilterBuilder
{
    Task<List<OpenAlexFilter>> BuildAsync(
        OpenAlexWorksSearchDto request,
        CancellationToken cancellationToken
    );
}
