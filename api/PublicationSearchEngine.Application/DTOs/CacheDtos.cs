namespace PublicationSearchEngine.Application.DTOs;

public class OpenAlexAuthorWorksCacheDto
{
    public List<OpenAlexWork> Works { get; set; } = [];
    public string? NextCursor { get; set; }
    public int CurrentIndex { get; set; }
    public long TotalCount { get; set; }

    public static string GetCacheKey(string OpenAlexAuthorId) =>
        $"OpenAlex:OpenAlexAuthorId-Works:{OpenAlexAuthorId}";

    public static string GetCacheKeySortedByPublicationDate(string openAlexAuthorId) =>
        $"OpenAlex:OpenAlexAuthorId-Works-SortedByPublicationDate:{openAlexAuthorId}";

    public static string GetCacheKeySortedByCitationCount(string openAlexAuthorId) =>
        $"OpenAlex:OpenAlexAuthorId-Works-SortedByCitationCount:{openAlexAuthorId}";
}

public class OpenAlexOrcidAuthorCacheDto
{
    public string OpenAlexAuthorId { get; set; } = string.Empty;

    public static string GetCacheKey(string orcid)
    {
        return $"OpenAlex:Orcid-Author:{orcid}";
    }
}

public class OpenAlexDoiWorkCacheDto
{
    public OpenAlexWork? Work { get; set; }

    public static string GetCacheKey(string doi)
    {
        return $"OpenAlex:Doi-Work:{doi}";
    }
}
