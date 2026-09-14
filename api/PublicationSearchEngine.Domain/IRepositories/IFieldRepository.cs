using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Domain.IRepositories;

public interface IFieldRepository
{
    Task<List<Field>> GetAllAsync(CancellationToken cancellationToken);
    Task AddRangeAsync(IEnumerable<Field> entities, CancellationToken cancellationToken);
    void UpdateRange(IEnumerable<Field> entities);
    void DeleteRange(IEnumerable<Field> entities);
}
