using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Application.Interfaces;
using PublicationSearchEngine.Application.Shared.Consts;
using PublicationSearchEngine.Application.Shared.ExtensionMethods;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Application.Shared.Builders;

public class OpenAlexWorksFilterBuilder : IOpenAlexWorksFilterBuilder
{
    private readonly IWorkTypeRepository _workTypeRepository;

    public OpenAlexWorksFilterBuilder(IWorkTypeRepository workTypeRepository)
    {
        _workTypeRepository = workTypeRepository;
    }

    public async Task<List<OpenAlexFilter>> BuildAsync(
        OpenAlexWorksSearchDto request,
        CancellationToken cancellationToken
    )
    {
        var filters = new List<OpenAlexFilter>();

        AddAuthorFilter(filters, request);

        AddFromPublicationDateFilter(filters, request);

        AddToPublicationDateFilter(filters, request);

        AddFieldFilter(filters, request);

        AddSubFieldFilter(filters, request);

        AddTopicFilter(filters, request);

        AddInstitutionFilter(filters, request);

        AddKeywordFilter(filters, request);

        await AddWorkTypeFilterAsync(filters, request, cancellationToken);

        return filters;
    }

    private static void AddAuthorFilter(
        List<OpenAlexFilter> filters,
        OpenAlexWorksSearchDto request
    )
    {
        if (string.IsNullOrWhiteSpace(request.OpenAlexAuthorId))
            return;

        var authorId = request.OpenAlexAuthorId.ExtractOpenAlexId();

        if (string.IsNullOrWhiteSpace(authorId))
            return;

        filters.Add(new OpenAlexFilter { Attribute = "author.id", Value = authorId });
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
        var fieldIds = request.OpenAlexFieldIds.NormalizeStringList(x =>
            x.ExtractOpenAlexFieldId()
        );

        if (fieldIds.Count == 0)
            return;

        filters.Add(
            new OpenAlexFilter
            {
                Attribute = "primary_topic.field.id",
                Value = string.Join("|", fieldIds),
            }
        );
    }

    private static void AddSubFieldFilter(
        List<OpenAlexFilter> filters,
        OpenAlexWorksSearchDto request
    )
    {
        var subFieldIds = request.OpenAlexSubFieldIds.NormalizeStringList(x =>
            x.ExtractOpenAlexSubfieldId()
        );

        if (subFieldIds.Count == 0)
            return;

        filters.Add(
            new OpenAlexFilter
            {
                Attribute = "primary_topic.subfield.id",
                Value = string.Join("|", subFieldIds),
            }
        );
    }

    private static void AddTopicFilter(List<OpenAlexFilter> filters, OpenAlexWorksSearchDto request)
    {
        var topicIds = request.OpenAlexTopicIds.NormalizeStringList(x =>
            x.ExtractOpenAlexTopicId()
        );

        if (topicIds.Count == 0)
            return;

        filters.Add(
            new OpenAlexFilter
            {
                Attribute = "primary_topic.id",
                Value = string.Join("|", topicIds),
            }
        );
    }

    private static void AddKeywordFilter(
        List<OpenAlexFilter> filters,
        OpenAlexWorksSearchDto request
    )
    {
        var keywordIds = request.OpenAlexKeywordIds.NormalizeStringList(x =>
            x.ExtractOpenAlexKeywordId()
        );

        if (keywordIds.Count == 0)
            return;

        filters.Add(
            new OpenAlexFilter { Attribute = "keywords.id", Value = string.Join("|", keywordIds) }
        );
    }

    private static void AddInstitutionFilter(
        List<OpenAlexFilter> filters,
        OpenAlexWorksSearchDto request
    )
    {
        var institutionIds = request.OpenAlexInstitutionIds.NormalizeStringList(x =>
            x.ExtractOpenAlexId()
        );

        if (institutionIds.Count == 0)
            return;

        filters.Add(
            new OpenAlexFilter
            {
                Attribute = "authorships.institutions.id",
                Value = string.Join("|", institutionIds),
            }
        );
    }

    private async Task AddWorkTypeFilterAsync(
        List<OpenAlexFilter> filters,
        OpenAlexWorksSearchDto request,
        CancellationToken cancellationToken
    )
    {
        if (request.Types.Count == 0)
            return;

        var workTypes = await _workTypeRepository.GetByTypesAsync(request.Types, cancellationToken);

        var openAlexTypes = workTypes
            .Select(x => x.OpenAlexId)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (openAlexTypes.Count == 0)
            return;

        filters.Add(
            new OpenAlexFilter { Attribute = "type", Value = string.Join("|", openAlexTypes) }
        );
    }
}
