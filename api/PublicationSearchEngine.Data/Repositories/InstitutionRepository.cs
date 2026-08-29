using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Data.Repositories;

public class InstitutionRepository : IInstitutionRepository
{
    private readonly PublicationDbContext _context;

    public InstitutionRepository(PublicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Institution>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.Institutions.ToListAsync(cancellationToken);
    }

    public async Task AddRangeAsync(
        IEnumerable<Institution> entities,
        CancellationToken cancellationToken
    )
    {
        await _context.Institutions.AddRangeAsync(entities, cancellationToken);
    }

    public async Task AddAsync(Institution entity, CancellationToken cancellationToken)
    {
        await _context.Institutions.AddAsync(entity, cancellationToken);
    }

    public async Task<Institution?> FirstOrDefaultAsync(
        Expression<Func<Institution, bool>>? predicate = null,
        CancellationToken cancellationToken = default
    )
    {
        return predicate is null
            ? await _context.Institutions.FirstOrDefaultAsync(cancellationToken)
            : await _context.Institutions.FirstOrDefaultAsync(predicate, cancellationToken);
    }
}
