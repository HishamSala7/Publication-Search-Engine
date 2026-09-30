using System.Globalization;

namespace PublicationSearchEngine.Application.Shared.ExtensionMethods;

public static class DatesExtensionMethods
{
    public static DateOnly? ToNullableDateOnly(this string? date, string format = "d-M-yyyy")
    {
        return DateOnly.TryParseExact(
            date,
            format,
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var value
        )
            ? value
            : null;
    }
}
