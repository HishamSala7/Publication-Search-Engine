using System.Net.Http.Json;
using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Domain.Shared.Enums;

namespace PublicationSearchEngine.Application.Services;

public class RorService
{
    private readonly HttpClient _httpClient;

    public RorService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<RorSearchResult?> FindByDomainAsync(string domain, CancellationToken ct)
    {
        var url = $"organizations?query.advanced=domains:{Uri.EscapeDataString(domain)}";
        var response = await _httpClient.GetFromJsonAsync<RorSearchResponse>(url, ct);

        if (response == null || response.NumberOfResults == 0)
            return null;

        return new RorSearchResult
        {
            Organization = response.Items.First(),
            Method = InstitutionResolutionMethod.Domain,
        };
    }

    public async Task<RorSearchResult?> SearchByNameAsync(
        string name,
        string? countryHint,
        CancellationToken ct
    )
    {
        var exact = await SearchAsync($"\"{name}\"", countryHint, ct);
        if (exact != null)
        {
            return new RorSearchResult
            {
                Organization = exact,
                Method = InstitutionResolutionMethod.NameExact,
            };
        }

        var fuzzy = await SearchAsync(name, countryHint, ct);
        if (fuzzy != null)
        {
            return new RorSearchResult
            {
                Organization = fuzzy,
                Method = InstitutionResolutionMethod.NameFuzzy,
            };
        }

        return null;
    }

    private async Task<RorOrganization?> SearchAsync(
        string queryText,
        string? countryHint,
        CancellationToken ct
    )
    {
        var url = $"organizations?query={Uri.EscapeDataString(queryText)}";
        var response = await _httpClient.GetFromJsonAsync<RorSearchResponse>(url, ct);

        if (response == null || response.NumberOfResults == 0)
            return null;

        if (!string.IsNullOrWhiteSpace(countryHint))
        {
            var countryMatch = response.Items.FirstOrDefault(org =>
                org.Locations?.Any(l =>
                    string.Equals(
                        l.GeonamesDetails?.CountryName,
                        countryHint,
                        StringComparison.OrdinalIgnoreCase
                    )
                ) == true
            );

            if (countryMatch != null)
                return countryMatch;
        }

        return response.Items.First();
    }
}
