using System.Text.RegularExpressions;

namespace PublicationSearchEngine.Application.Shared.ExtensionMethods;

public static class DoiExtensionMethods
{
    private static readonly Regex DoiRegex = new(
        @"10\.\d{4,9}/[-._;()/:A-Z0-9]+",
        RegexOptions.IgnoreCase | RegexOptions.Compiled
    );

    public static string? ExtractDoi(this string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        var match = DoiRegex.Match(value.Trim());

        if (!match.Success)
            return null;

        return match.Value.TrimEnd('.', ',', ';', ')', ']', '}');
    }
}
