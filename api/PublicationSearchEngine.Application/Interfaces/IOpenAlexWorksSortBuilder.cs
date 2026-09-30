using PublicationSearchEngine.Application.DTOs;

namespace PublicationSearchEngine.Application.Interfaces;

public interface IOpenAlexWorksSortBuilder
{
    List<OpenAlexSort> Build(OpenAlexWorksSearchDto request);
}
