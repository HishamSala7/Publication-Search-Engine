using System.Text.Json.Serialization;
using PublicationSearchEngine.Domain.Shared.Enums;

namespace PublicationSearchEngine.Application.DTOs;

public class RorRequestConfiguration
{
    public string? BaseUrl { get; set; }
}

public class RorOrganization
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = default!; // "https://ror.org/00f54p054"

    [JsonPropertyName("names")]
    public List<RorName> Names { get; set; } = new();

    [JsonPropertyName("domains")]
    public List<string> Domains { get; set; } = new();

    [JsonPropertyName("locations")]
    public List<RorLocation>? Locations { get; set; }

    [JsonPropertyName("relationships")]
    public List<RorRelationship>? Relationships { get; set; } // parent/child/related orgs
}

public class RorSearchResult
{
    public RorOrganization? Organization { get; set; }
    public InstitutionResolutionMethod? Method { get; set; }
}

public class RorName
{
    [JsonPropertyName("value")]
    public string Value { get; set; } = default!;

    [JsonPropertyName("types")]
    public List<string> Types { get; set; } = new(); // "ror_display", "label", "alias"
}

public class RorLocation
{
    [JsonPropertyName("geonames_details")]
    public RorGeonamesDetails? GeonamesDetails { get; set; }
}

public class RorGeonamesDetails
{
    [JsonPropertyName("country_name")]
    public string? CountryName { get; set; }

    [JsonPropertyName("country_code")]
    public string? CountryCode { get; set; }
}

public class RorRelationship
{
    [JsonPropertyName("type")]
    public string? Type { get; set; } // "Parent", "Child", "Related"

    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("label")]
    public string? Label { get; set; }
}

public class RorSearchResponse
{
    [JsonPropertyName("number_of_results")]
    public int NumberOfResults { get; set; }

    [JsonPropertyName("items")]
    public List<RorOrganization> Items { get; set; } = new();
}
