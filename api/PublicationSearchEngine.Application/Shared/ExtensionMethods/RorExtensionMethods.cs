namespace PublicationSearchEngine.Application.Shared.ExtensionMethods;

public static class RorExtensionMethods
{
    public static string? ExtractRorId(this string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        value = value.Trim().TrimEnd('/');

        var id = value.Split('/').LastOrDefault();

        if (string.IsNullOrWhiteSpace(id))
            return null;

        return IsRorId(id) ? id.ToLowerInvariant() : null;
    }

    private static bool IsRorId(string value)
    {
        return value.Length == 9 && value.All(char.IsLetterOrDigit);
    }
}
