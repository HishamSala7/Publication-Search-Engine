using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Data.Repositories;

public class InstitutionDomainRepository : IInstitutionDomainRepository
{
    private readonly PublicationDbContext _context;

    public InstitutionDomainRepository(PublicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<InstitutionDomain>> GetAllAsync(
        CancellationToken cancellationToken
    )
    {
        return await _context.InstitutionDomains.ToListAsync(cancellationToken);
    }

    public async Task AddRangeAsync(
        IEnumerable<InstitutionDomain> entities,
        CancellationToken cancellationToken
    )
    {
        await _context.InstitutionDomains.AddRangeAsync(entities, cancellationToken);
    }

    public async Task<InstitutionDomain?> GetDomainWithIncludeInstitutionAsync(
        Expression<Func<InstitutionDomain, bool>> predicate,
        CancellationToken cancellationToken
    )
    {
        return await _context
            .InstitutionDomains.Include(x => x.Institution)
            .FirstOrDefaultAsync(predicate, cancellationToken);
    }

    public async Task AddAsync(InstitutionDomain entity, CancellationToken cancellationToken)
    {
        await _context.InstitutionDomains.AddAsync(entity, cancellationToken);
    }

    public async Task<bool> AnyAsync(
        Expression<Func<InstitutionDomain, bool>>? predicate = null,
        CancellationToken cancellationToken = default
    )
    {
        return predicate is null
            ? await _context.InstitutionDomains.AnyAsync(cancellationToken)
            : await _context.InstitutionDomains.AnyAsync(predicate, cancellationToken);
    }

    public async Task<IReadOnlyList<InstitutionDomain>> GetAllWithFilterAsync(
        Expression<Func<InstitutionDomain, bool>> predicate,
        CancellationToken cancellationToken
    )
    {
        return await _context.InstitutionDomains.Where(predicate).ToListAsync(cancellationToken);
    }
}
