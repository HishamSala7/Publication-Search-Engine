using System.Linq.Expressions;
using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Domain.IRepositories;

public interface ISubFieldRepository
{
    Task<List<SubField>> GetAllAsync(CancellationToken cancellationToken);
    Task AddRangeAsync(IEnumerable<SubField> entities, CancellationToken cancellationToken);
    void UpdateRange(IEnumerable<SubField> entities);
    void DeleteRange(IEnumerable<SubField> entities);
    Task<SubField?> FirstOrDefaultAsync(
        Expression<Func<SubField, bool>>? predicate = null,
        CancellationToken cancellationToken = default
    );
    Task<(List<SubField>, long)> SearchWithPaginationAsync(
        List<Guid> fieldIds,
        int take,
        int skip,
        string? filter,
        CancellationToken cancellationToken
    );
}
