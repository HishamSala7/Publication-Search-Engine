namespace PublicationSearchEngine.Application.Shared.ExtensionMethods;

public static class OrcidExtensionMethods
{
    public static string? ExtractOrcid(this string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        value = value.Trim().TrimEnd('/');

        var orcid = value.Split('/').LastOrDefault();

        if (string.IsNullOrWhiteSpace(orcid))
            return null;

        orcid = orcid.ToUpperInvariant();

        return IsValidOrcid(orcid) ? orcid : null;
    }

    private static bool IsValidOrcid(string value)
    {
        if (value.Length != 19)
            return false;

        if (value[4] != '-' || value[9] != '-' || value[14] != '-')
            return false;

        var normalized = value.Replace("-", string.Empty);

        return normalized[..15].All(char.IsDigit)
            && (char.IsDigit(normalized[15]) || normalized[15] == 'X');
    }
}
