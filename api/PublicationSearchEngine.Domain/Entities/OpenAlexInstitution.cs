namespace PublicationSearchEngine.Domain.Entities;

public class OpenAlexInstitution : EntityBase
{
    public string OpenAlexId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Ror { get; set; }
    public Guid? CountryId { get; set; }
    public long WorksCount { get; set; }
    public DateTime SyncedAt { get; set; }
    public virtual Country? Country { get; set; }
}
