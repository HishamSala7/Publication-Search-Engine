using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Domain.IRepositories;

public interface ISubFieldRepository
{
    Task<List<SubField>> GetAllAsync(CancellationToken cancellationToken);
    Task AddRangeAsync(IEnumerable<SubField> entities, CancellationToken cancellationToken);
    void UpdateRange(IEnumerable<SubField> entities);
    void DeleteRange(IEnumerable<SubField> entities);
}
