namespace PublicationSearchEngine.Domain.Entities;

public class SubField : EntityBase
{
    public string OpenAlexId { get; set; } = string.Empty;
    public Guid? FieldId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public long WorksCount { get; set; }
    public DateTime SyncedAt { get; set; }
    public virtual Field? Field { get; set; }
    public virtual ICollection<Topic> Topics { get; set; } = [];
}
