namespace PublicationSearchEngine.Domain.Entities;

public class Topic : EntityBase
{
    public string OpenAlexId { get; set; } = string.Empty;
    public Guid? SubFieldId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public long WorksCount { get; set; }
    public DateTime SyncedAt { get; set; }
    public virtual SubField? SubField { get; set; }
    public virtual ICollection<TopicKeyword> TopicKeywords { get; set; } = [];
}
