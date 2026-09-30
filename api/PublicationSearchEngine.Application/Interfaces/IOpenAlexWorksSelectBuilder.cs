using PublicationSearchEngine.Application.DTOs;

namespace PublicationSearchEngine.Application.Interfaces;

public interface IOpenAlexWorksSelectBuilder
{
    List<string> Build(OpenAlexWorksSelectDto request);
}
