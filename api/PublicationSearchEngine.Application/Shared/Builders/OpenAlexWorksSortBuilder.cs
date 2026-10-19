using PublicationSearchEngine.Application.DTOs;

namespace PublicationSearchEngine.Application.Shared.Builders;

public class OpenAlexWorksSortBuilder
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
