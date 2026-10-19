using PublicationSearchEngine.Application.Shared.Keys;
using PublicationSearchEngine.Domain.Shared.Enums;

namespace PublicationSearchEngine.Application.Shared.Builders;

public class OpenAlexResearcherGraphGroupByBuilder
{
    public string Build(OpenAlexGraphMode mode)
    {
        return mode switch
        {
            OpenAlexGraphMode.Year => OpenAlexWorkAttributesKeys.PublicationYear,

            OpenAlexGraphMode.Institution => OpenAlexWorkAttributesKeys.AuthorshipInstitutionId,

            OpenAlexGraphMode.Field => OpenAlexWorkAttributesKeys.PrimaryTopicFieldId,

            OpenAlexGraphMode.SubField => OpenAlexWorkAttributesKeys.PrimaryTopicSubFieldId,

            OpenAlexGraphMode.PublicationType => OpenAlexWorkAttributesKeys.Type,

            _ => OpenAlexWorkAttributesKeys.PublicationYear,
        };
    }
}
