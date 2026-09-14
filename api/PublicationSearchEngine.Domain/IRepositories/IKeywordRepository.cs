using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Domain.IRepositories;

public interface IKeywordRepository
{
    Task<List<Keyword>> GetAllAsync(CancellationToken cancellationToken);
    Task AddRangeAsync(IEnumerable<Keyword> entities, CancellationToken cancellationToken);
    void UpdateRange(IEnumerable<Keyword> entities);
    void DeleteRange(IEnumerable<Keyword> entities);
}
