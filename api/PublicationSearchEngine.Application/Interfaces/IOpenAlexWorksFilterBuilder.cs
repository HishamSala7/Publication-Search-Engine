using PublicationSearchEngine.Application.DTOs;

namespace PublicationSearchEngine.Application.Interfaces;

public interface IOpenAlexWorksFilterBuilder
{
    List<OpenAlexFilter> Build(OpenAlexWorksSearchDto request);
}
