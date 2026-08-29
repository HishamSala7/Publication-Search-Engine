using System.Text.Json.Serialization;

namespace PublicationSearchEngine.Application.DTOs;

public class HipoRequestConfiguration
{
    public string? BaseUrl { get; set; }
}

public class HipoDomainSyncResponseDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("country")]
    public string? Country { get; set; }

    [JsonPropertyName("alpha_two_code")]
    public string? AlphaTwoCode { get; set; }

    [JsonPropertyName("domains")]
    public List<string> Domains { get; set; } = [];

    [JsonPropertyName("web_pages")]
    public List<string> WebPages { get; set; } = [];
}
