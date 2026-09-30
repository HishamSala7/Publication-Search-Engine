using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Application.Interfaces;
using PublicationSearchEngine.Application.Shared.Keys;

namespace PublicationSearchEngine.Application.Shared.Builders;

public class OpenAlexWorksSelectBuilder : IOpenAlexWorksSelectBuilder
{
    public List<string> Build(OpenAlexWorksSelectDto request)
    {
        var selects = new List<string>();

        AddId(selects, request);

        AddAuthorships(selects, request);

        return selects;
    }

    private static void AddId(List<string> selects, OpenAlexWorksSelectDto request)
    {
        if (!request.IncludeId)
            return;

        selects.Add(OpenAlexWorkAttributesKeys.Id);
    }

    private static void AddAuthorships(List<string> selects, OpenAlexWorksSelectDto request)
    {
        if (!request.IncludeAuthorships)
            return;

        selects.Add(OpenAlexWorkAttributesKeys.Authorships);
    }
}
