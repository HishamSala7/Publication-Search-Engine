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

    private static bool IsOpenAlexId(string value)
    {
        if (value.Length < 2)
            return false;

        var prefix = char.ToUpperInvariant(value[0]);

        if (!OpenAlexEntityPrefixes.Contains(prefix))
            return false;

        return value[1..].All(char.IsDigit);
    }
}
