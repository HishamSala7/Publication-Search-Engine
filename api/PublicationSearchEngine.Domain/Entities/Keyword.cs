namespace PublicationSearchEngine.Domain.Entities;

public class Keyword : EntityBase
{
    public string OpenAlexId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public long WorksCount { get; set; }
    public DateTime SyncedAt { get; set; }
    public virtual ICollection<TopicKeyword> TopicKeywords { get; set; } = [];
}
