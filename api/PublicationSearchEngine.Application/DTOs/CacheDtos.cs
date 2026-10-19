using PublicationSearchEngine.Domain.Shared.Enums;

namespace PublicationSearchEngine.Application.DTOs;

public class OpenAlexWorksCacheDto
{
    public List<OpenAlexWork> Works { get; set; } = [];
    public Dictionary<int, string?> CursorMap { get; set; } = [];
    public int TotalCount { get; set; }
    public DateTime CachedAt { get; set; }
}

public class OpenAlexWorksCacheKeyDto
{
    public string? OpenAlexAuthorId { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public List<string> FieldIds { get; set; } = [];
    public List<string> SubFieldIds { get; set; } = [];
    public List<string> TopicIds { get; set; } = [];
    public List<string> KeywordIds { get; set; } = [];
    public List<string> InstitutionIds { get; set; } = [];
    public List<PublicationType> Types { get; set; } = [];
    public string? OrderBy { get; set; }
    public bool IsDescending { get; set; }
}

public class OpenAlexOrcidAuthorCacheDto
{
    public string OpenAlexAuthorId { get; set; } = string.Empty;

    public static string GetCacheKey(string orcid)
    {
        return $"openalex:orcid-author:{orcid}";
    }
}

public class OpenAlexDoiWorkCacheDto
{
    public OpenAlexWork? Work { get; set; }

    public static string GetCacheKey(string doi)
    {
        return $"openalex:doi-work:{doi}";
    }
}

public class OpenAlexRorInstitutionCacheDto
{
    public OpenAlexInstitutionSimpleDto? Institution { get; set; }

    public static string GetCacheKey(string ror)
    {
        return $"openalex:ror-institution:{ror}";
    }
}

public static class OpenAlexAuthorPositionCountCacheDto
{
    public static string GetCacheKey(string openAlexAuthorId)
    {
        return $"openalex:author-authorPositionCounts:{openAlexAuthorId}";
    }
}

public class OpenAlexAuthorDetailCacheDto
{
    public OpenAlexAuthorDetail? Author { get; set; }

    public static string GetCacheKey(string openAlexAuthorId)
    {
        return $"openalex:author-detail:{openAlexAuthorId.ToUpperInvariant()}";
    }
}

public class OpenAlexInstitutionGraphCacheKeyDto
{
    public string OpenAlexInstitutionId { get; set; } = string.Empty;
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public List<string> FieldIds { get; set; } = [];
    public List<PublicationType> Types { get; set; } = [];
}

public class OpenAlexAuthorGraphCacheKeyDto
{
    public string OpenAlexAuthorId { get; set; } = string.Empty;
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public List<string> InstitutionIds { get; set; } = [];
    public List<string> FieldIds { get; set; } = [];
    public List<string> SubFieldIds { get; set; } = [];
    public List<PublicationType> Types { get; set; } = [];
    public OpenAlexGraphMode Mode { get; set; }
}

public class OpenAlexAuthorGroupedGraphCacheDto
{
    public List<OpenAlexAuthorGraphItemDto> Items { get; set; } = [];
}
