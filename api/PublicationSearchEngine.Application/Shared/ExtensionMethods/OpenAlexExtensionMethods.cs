namespace PublicationSearchEngine.Application.Shared.ExtensionMethods;

public static class OpenAlexExtensionMethods
{
    private static readonly HashSet<char> OpenAlexEntityPrefixes =
    [
        'W', // Work
        'A', // Author
        'S', // Source
        'I', // Institution
        'C', // Concept (legacy/deprecated entity)
        'P', // Publisher
        'F', // Funder
        'T', // Topic
    ];

    public static string? ExtractOpenAlexId(this string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        value = value.Trim().TrimEnd('/');

        var id = value.Split('/').LastOrDefault();

        if (string.IsNullOrWhiteSpace(id))
            return null;

        return IsOpenAlexId(id) ? id.ToUpperInvariant() : null;
    }

    public static string? ExtractOpenAlexFieldId(this string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        value = value.Trim().TrimEnd('/');

        var id = value.Split('/').LastOrDefault();

        if (string.IsNullOrWhiteSpace(id))
            return null;

        return id.All(char.IsDigit) ? id : null;
    }

    public static string? ExtractOpenAlexSubfieldId(this string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        value = value.Trim().TrimEnd('/');

        var id = value.Split('/').LastOrDefault();

        if (string.IsNullOrWhiteSpace(id))
            return null;

        return id.All(char.IsDigit) ? id : null;
    }

    public static string? ExtractOpenAlexTopicId(this string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        value = value.Trim().TrimEnd('/');

        var id = value.Split('/').LastOrDefault();

        if (string.IsNullOrWhiteSpace(id))
            return null;

        return IsOpenAlexTopicId(id) ? id.ToUpperInvariant() : null;
    }

    public static string? ExtractOpenAlexKeywordId(this string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        value = value.Trim().TrimEnd('/');

        var id = value.Split('/').LastOrDefault();

        if (string.IsNullOrWhiteSpace(id))
            return null;

        return IsOpenAlexKeywordId(id) ? id.ToLowerInvariant() : null;
    }

    public static List<string> NormalizeStringList(
        this IEnumerable<string>? values,
        Func<string?, string?> extractor
    )
    {
        if (values == null)
            return [];

        return values
            .Select(extractor)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Order(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static bool IsOpenAlexId(string value)
    {
        if (value.Length < 2)
            return false;

        var prefix = char.ToUpperInvariant(value[0]);

        if (!OpenAlexEntityPrefixes.Contains(prefix))
            return false;

        return value[1..].All(char.IsDigit);
    }

    private static bool IsOpenAlexTopicId(string value)
    {
        return value.Length >= 2
            && char.ToUpperInvariant(value[0]) == 'T'
            && value[1..].All(char.IsDigit);
    }

    private static bool IsOpenAlexKeywordId(string value)
    {
        return value.All(c => char.IsLetterOrDigit(c) || c == '-');
    }
}
