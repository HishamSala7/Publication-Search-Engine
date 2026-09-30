using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Application.Interfaces;
using PublicationSearchEngine.Application.Shared.Consts;
using PublicationSearchEngine.Application.Shared.ExtensionMethods;

namespace PublicationSearchEngine.Application.Shared.Builders;

public class OpenAlexWorksFilterBuilder : IOpenAlexWorksFilterBuilder
{
    public List<OpenAlexFilter> Build(OpenAlexWorksSearchDto request)
    {
        var filters = new List<OpenAlexFilter>();

        AddAuthorFilter(filters, request);

        AddFromPublicationDateFilter(filters, request);

        AddToPublicationDateFilter(filters, request);

        AddFieldFilter(filters, request);

        AddSubFieldFilter(filters, request);

        AddTopicFilter(filters, request);

        AddKeywordFilter(filters, request);

        return filters;
    }

    private static void AddAuthorFilter(
        List<OpenAlexFilter> filters,
        OpenAlexWorksSearchDto request
    )
    {
        if (string.IsNullOrWhiteSpace(request.OpenAlexAuthorId))
            return;

        filters.Add(
            new OpenAlexFilter { Attribute = "author.id", Value = request.OpenAlexAuthorId }
        );
    }

    private static void AddFromPublicationDateFilter(
        List<OpenAlexFilter> filters,
        OpenAlexWorksSearchDto request
    )
    {
        var startDate = request.StartDate.ToNullableDateOnly(OpenAlexConsts.DateFormat);

        if (!startDate.HasValue)
            return;

        filters.Add(
            new OpenAlexFilter
            {
                Attribute = "from_publication_date",
                Value = startDate.Value.ToString(OpenAlexConsts.DateFormat),
            }
        );
    }

    private static void AddToPublicationDateFilter(
        List<OpenAlexFilter> filters,
        OpenAlexWorksSearchDto request
    )
    {
        var endDate = request.EndDate.ToNullableDateOnly(OpenAlexConsts.DateFormat);

        if (!endDate.HasValue)
            return;

        filters.Add(
            new OpenAlexFilter
            {
                Attribute = "to_publication_date",
                Value = endDate.Value.ToString(OpenAlexConsts.DateFormat),
            }
        );
    }

    private static void AddFieldFilter(List<OpenAlexFilter> filters, OpenAlexWorksSearchDto request)
    {
        if (request.OpenAlexFieldIds.Count == 0)
            return;

        filters.Add(
            new OpenAlexFilter
            {
                Attribute = "primary_topic.field.id",
                Value = string.Join("|", request.OpenAlexFieldIds),
            }
        );
    }

    private static void AddSubFieldFilter(
        List<OpenAlexFilter> filters,
        OpenAlexWorksSearchDto request
    )
    {
        if (request.OpenAlexSubFieldIds.Count == 0)
            return;

        filters.Add(
            new OpenAlexFilter
            {
                Attribute = "primary_topic.subfield.id",
                Value = string.Join("|", request.OpenAlexSubFieldIds),
            }
        );
    }

    private static void AddTopicFilter(List<OpenAlexFilter> filters, OpenAlexWorksSearchDto request)
    {
        if (request.OpenAlexTopicIds.Count == 0)
            return;

        filters.Add(
            new OpenAlexFilter
            {
                Attribute = "primary_topic.id",
                Value = string.Join("|", request.OpenAlexTopicIds),
            }
        );
    }

    private static void AddKeywordFilter(
        List<OpenAlexFilter> filters,
        OpenAlexWorksSearchDto request
    )
    {
        if (request.OpenAlexKeywordIds.Count == 0)
            return;

        filters.Add(
            new OpenAlexFilter
            {
                Attribute = "keywords.id",
                Value = string.Join("|", request.OpenAlexKeywordIds),
            }
        );
    }
}
