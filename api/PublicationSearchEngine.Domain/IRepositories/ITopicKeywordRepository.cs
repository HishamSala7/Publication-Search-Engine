using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Domain.IRepositories;

public interface ITopicKeywordRepository 
{
    Task<List<TopicKeyword>> GetAllAsync(CancellationToken cancellationToken);
    Task AddRangeAsync(IEnumerable<TopicKeyword> entities, CancellationToken cancellationToken);
    void UpdateRange(IEnumerable<TopicKeyword> entities);
    void DeleteRange(IEnumerable<TopicKeyword> entities);
}
