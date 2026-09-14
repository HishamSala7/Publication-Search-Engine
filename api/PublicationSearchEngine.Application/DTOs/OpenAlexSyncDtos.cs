using System.Text.Json.Serialization;

namespace PublicationSearchEngine.Application.DTOs;

public class OpenAlexResponse<T>
    where T : class
{
    [JsonPropertyName("meta")]
    public OpenAlexMeta? Meta { get; set; }

    [JsonPropertyName("results")]
    public List<T> Results { get; set; } = [];
}

public class OpenAlexMeta
{
    [JsonPropertyName("count")]
    public int Count { get; set; }

    [JsonPropertyName("next_cursor")]
    public string? NextCursor { get; set; }
}

public class OpenAlexCountryDto
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("display_name")]
    public string? DisplayName { get; set; }

    [JsonPropertyName("country_code")]
    public string? CountryCodeAlphaTwo { get; set; }

    [JsonPropertyName("alpha_3")]
    public string? CountryCodeAlphaThree { get; set; }

    [JsonPropertyName("continent")]
    public OpenAlexContinent? Continent { get; set; }

    [JsonPropertyName("works_count")]
    public long? WorksCount { get; set; }
}

public class OpenAlexContinent
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("display_name")]
    public string? DisplayName { get; set; }
}

public class OpenAlexFieldDto
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("display_name")]
    public string? DisplayName { get; set; }

    [JsonPropertyName("works_count")]
    public long? WorksCount { get; set; }
}

public class OpenAlexSubfieldDto
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("display_name")]
    public string? DisplayName { get; set; }

    [JsonPropertyName("works_count")]
    public long? WorksCount { get; set; }

    [JsonPropertyName("field")]
    public OpenAlexFieldDto? Field { get; set; }
}

public class OpenAlexTopicDto
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("display_name")]
    public string? DisplayName { get; set; }

    [JsonPropertyName("works_count")]
    public long? WorksCount { get; set; }

    [JsonPropertyName("subfield")]
    public OpenAlexSubfieldDto? SubField { get; set; }

    [JsonPropertyName("keywords")]
    public List<string>? Keywords { get; set; }
}

public class OpenAlexKeywordDto
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("display_name")]
    public string? DisplayName { get; set; }

    [JsonPropertyName("works_count")]
    public long? WorksCount { get; set; }
}
