using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Domain.IRepositories;

public interface ITopicRepository
{
    Task<List<Topic>> GetAllAsync(CancellationToken cancellationToken);
    Task AddRangeAsync(IEnumerable<Topic> entities, CancellationToken cancellationToken);
    void UpdateRange(IEnumerable<Topic> entities);
    void DeleteRange(IEnumerable<Topic> entities);
    Task<(List<Topic>, long)> SearchWithPaginationAsync(
        List<Guid> fieldIds,
        List<Guid> subfieldIds,
        int take,
        int skip,
        string? filter,
        CancellationToken cancellationToken
    );
}
