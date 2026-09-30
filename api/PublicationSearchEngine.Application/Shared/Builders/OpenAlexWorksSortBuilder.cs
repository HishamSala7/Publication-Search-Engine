using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Application.Interfaces;

namespace PublicationSearchEngine.Application.Shared.Builders;

public class OpenAlexWorksSortBuilder : IOpenAlexWorksSortBuilder
{
    public List<OpenAlexSort> Build(OpenAlexWorksSearchDto request)
    {
        if (string.IsNullOrWhiteSpace(request.OrderBy))
            return [];

        return
        [
            new OpenAlexSort { Attribute = request.OrderBy, IsDescending = request.IsDescending },
        ];
    }
}
