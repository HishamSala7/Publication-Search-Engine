using System.Linq.Expressions;
using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Domain.IRepositories;

public interface IInstitutionDomainRepository
{
    Task<IReadOnlyList<InstitutionDomain>> GetAllAsync(CancellationToken cancellationToken);
    Task<InstitutionDomain?> GetDomainWithIncludeInstitutionAsync(
        Expression<Func<InstitutionDomain, bool>> predicate,
        CancellationToken cancellationToken
    );

    Task<bool> AnyAsync(
        Expression<Func<InstitutionDomain, bool>>? predicate = null,
        CancellationToken cancellationToken = default
    );

    Task<IReadOnlyList<InstitutionDomain>> GetAllWithFilterAsync(
        Expression<Func<InstitutionDomain, bool>> predicate,
        CancellationToken cancellationToken
    );

    Task AddAsync(InstitutionDomain entity, CancellationToken cancellationToken);

    Task AddRangeAsync(
        IEnumerable<InstitutionDomain> entities,
        CancellationToken cancellationToken
    );
}
