namespace PublicationSearchEngine.Domain.Entities;

public class Country : EntityBase
{
    public string OpenAlexId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? CountryCodeAlphaTwo { get; set; } 
    public string? CountryCodeAlphaThree { get; set; } = string.Empty;
    public string Continent { get; set; } = string.Empty;
    public long WorksCount { get; set; }
    public DateTime SyncedAt { get; set; }
}
