using System.Text.Json.Serialization;

namespace PublicationSearchEngine.Application.DTOs;

public class OpenAlexRequestConfiguration
{
    public string? BaseUrl { get; set; }
    public string? MailTo { get; set; }
    public string? ApiKey { get; set; }
}

public class OpenAlexWork
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("doi")]
    public string? Doi { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("publication_year")]
    public int? PublicationYear { get; set; }

    [JsonPropertyName("publication_date")]
    public string? PublicationDate { get; set; }

    [JsonPropertyName("cited_by_count")]
    public long? CitedByCount { get; set; }

    [JsonPropertyName("abstract_inverted_index")]
    public Dictionary<string, List<int>>? AbstractInvertedIndex { get; set; }

    [JsonPropertyName("authorships")]
    public List<OpenAlexAuthorship>? Authorships { get; set; }

    [JsonPropertyName("primary_location")]
    public OpenAlexPrimaryLocation? PrimaryLocation { get; set; }
}

public class OpenAlexAuthorship
{
    [JsonPropertyName("author_position")]
    public string? AuthorPosition { get; set; }

    [JsonPropertyName("author")]
    public OpenAlexAuthor? Author { get; set; }
}

public class OpenAlexAuthor
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("display_name")]
    public string? DisplayName { get; set; }

    [JsonPropertyName("orcid")]
    public string? Orcid { get; set; }
}

public class OpenAlexPrimaryLocation
{
    [JsonPropertyName("source")]
    public OpenAlexSource? Source { get; set; }

    [JsonPropertyName("is_oa")]
    public bool? IsOpenAccess { get; set; }

    [JsonPropertyName("landing_page_url")]
    public string? LandingPageUrl { get; set; }
}

public class OpenAlexSource
{
    [JsonPropertyName("display_name")]
    public string? DisplayName { get; set; }
}

public class AuthorCandidate
{
    public string OpenAlexId { get; set; } = default!; // "A5023888391"
    public string DisplayName { get; set; } = default!;
    public string? Orcid { get; set; } // null if the author has none on record
    public string? Institution { get; set; } // their last known institution's display name
    public long WorksCount { get; set; }
    public long CitedByCount { get; set; }
}

public class OpenAlexAuthorDetail
{
    [JsonPropertyName("id")]
    public string? Id { get; set; } // "https://openalex.org/A5023888391"

    [JsonPropertyName("display_name")]
    public string? DisplayName { get; set; }

    [JsonPropertyName("orcid")]
    public string? Orcid { get; set; } // "https://orcid.org/0000-0002-1825-0097"

    [JsonPropertyName("works_count")]
    public long WorksCount { get; set; }

    [JsonPropertyName("cited_by_count")]
    public long CitedByCount { get; set; }

    [JsonPropertyName("last_known_institutions")]
    public List<OpenAlexInstitution>? LastKnownInstitutions { get; set; }

    [JsonPropertyName("affiliations")]
    public List<OpenAlexAffiliation>? Affiliations { get; set; }
}

public class OpenAlexAffiliation
{
    [JsonPropertyName("institution")]
    public OpenAlexInstitution? Institution { get; set; }

    [JsonPropertyName("years")]
    public List<int>? Years { get; set; } // years this affiliation was active
}

public class OpenAlexInstitution
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = default!; // "https://openalex.org/I136199984"

    [JsonPropertyName("display_name")]
    public string DisplayName { get; set; } = default!;

    [JsonPropertyName("ror")]
    public string? Ror { get; set; }

    [JsonPropertyName("lineage")]
    public List<string>? Lineage { get; set; } // hierarchy chain of institution IDs
}

public class OpenAlexWorksSearchDto : SearchDto
{
    public string? OpenAlexAuthorId { get; set; }
    public string? Orcid { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public List<string> OpenAlexFieldIds { get; set; } = [];
    public List<string> OpenAlexSubFieldIds { get; set; } = [];
    public List<string> OpenAlexTopicIds { get; set; } = [];
    public List<string> OpenAlexKeywordIds { get; set; } = [];
}

public class OpenAlexFilter
{
    public string Attribute { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

public class OpenAlexSort
{
    public string Attribute { get; set; } = string.Empty;
    public bool IsDescending { get; set; }
}

public class AuthorPositionCountDto
{
    public int FirstPositionCount { get; set; }
    public int MiddlePositionCount { get; set; }
    public int LastPositionCount { get; set; }
}

public class OpenAlexWorksSelectDto
{
    public bool IncludeId { get; set; }
    public bool IncludeAuthorships { get; set; }
}
