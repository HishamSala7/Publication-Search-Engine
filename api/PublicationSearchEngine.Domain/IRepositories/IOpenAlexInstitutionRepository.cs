using System.Linq.Expressions;
using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Domain.IRepositories;

public interface IOpenAlexInstitutionRepository
{
    Task<List<OpenAlexInstitution>> GetAllAsync(CancellationToken cancellationToken);
    Task<List<OpenAlexInstitution>> GetByOpenAlexIdsAsync(
        List<string> openAlexIds,
        CancellationToken cancellationToken
    );
    Task<OpenAlexInstitution?> FirstOrDefaultAsync(
        Expression<Func<OpenAlexInstitution, bool>>? predicate = null,
        CancellationToken cancellationToken = default
    );
    Task AddRangeAsync(
        IEnumerable<OpenAlexInstitution> entities,
        CancellationToken cancellationToken
    );
    void UpdateRange(IEnumerable<OpenAlexInstitution> entities);
    void DeleteRange(IEnumerable<OpenAlexInstitution> entities);
    Task<(List<OpenAlexInstitution>, long)> SearchWithPaginationAsync(
        int take,
        int skip,
        string? filter,
        CancellationToken cancellationToken
    );
}
