namespace PublicationSearchEngine.Domain.Entities;

public class Field : EntityBase
{
    public string OpenAlexId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public long WorksCount { get; set; }
    public DateTime SyncedAt { get; set; }
    public virtual ICollection<SubField> SubFields { get; set; } = [];
    public virtual ICollection<Topic> Topics { get; set; } = [];
}
