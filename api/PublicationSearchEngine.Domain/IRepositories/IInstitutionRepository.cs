using System.Linq.Expressions;
using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Domain.IRepositories;

public interface IInstitutionRepository
{
    Task<List<Institution>> GetAllAsync(CancellationToken cancellationToken);
    Task AddRangeAsync(IEnumerable<Institution> entities, CancellationToken cancellationToken);
    Task AddAsync(Institution entity, CancellationToken cancellationToken);
    Task<Institution?> FirstOrDefaultAsync(
        Expression<Func<Institution, bool>>? predicate = null,
        CancellationToken cancellationToken = default
    );
}
