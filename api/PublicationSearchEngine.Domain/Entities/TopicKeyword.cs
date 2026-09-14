namespace PublicationSearchEngine.Domain.Entities;

public class TopicKeyword : EntityBase
{
    public Guid TopicId { get; set; }
    public Guid KeywordId { get; set; }
    public virtual Topic? Topic { get; set; }
    public virtual Keyword? Keyword { get; set; }
}
