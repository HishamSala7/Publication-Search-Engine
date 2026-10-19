using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Data.Repositories;

public class OpenAlexInstitutionRepository : IOpenAlexInstitutionRepository
{
    private readonly PublicationDbContext _context;

    public OpenAlexInstitutionRepository(PublicationDbContext context)
    {
        _context = context;
    }

    public async Task AddRangeAsync(
        IEnumerable<OpenAlexInstitution> entities,
        CancellationToken cancellationToken
    )
    {
        await _context.OpenAlexInstitutions.AddRangeAsync(entities, cancellationToken);
    }

    public async Task<List<OpenAlexInstitution>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.OpenAlexInstitutions.ToListAsync(cancellationToken);
    }

    public async Task<List<OpenAlexInstitution>> GetByOpenAlexIdsAsync(
        List<string> openAlexIds,
        CancellationToken cancellationToken
    )
    {
        if (openAlexIds.Count == 0)
            return [];

        return await _context
            .OpenAlexInstitutions.AsNoTracking()
            .Where(x => openAlexIds.Contains(x.OpenAlexId))
            .ToListAsync(cancellationToken);
    }

    public async Task<OpenAlexInstitution?> FirstOrDefaultAsync(
        Expression<Func<OpenAlexInstitution, bool>>? predicate = null,
        CancellationToken cancellationToken = default
    )
    {
        return predicate is null
            ? await _context.OpenAlexInstitutions.FirstOrDefaultAsync(cancellationToken)
            : await _context.OpenAlexInstitutions.FirstOrDefaultAsync(predicate, cancellationToken);
    }

    public void UpdateRange(IEnumerable<OpenAlexInstitution> entities)
    {
        _context.OpenAlexInstitutions.UpdateRange(entities);
    }

    public void DeleteRange(IEnumerable<OpenAlexInstitution> entities)
    {
        _context.OpenAlexInstitutions.RemoveRange(entities);
    }

    public async Task<(List<OpenAlexInstitution>, long)> SearchWithPaginationAsync(
        int take,
        int skip,
        string? filter,
        CancellationToken cancellationToken
    )
    {
        var query = _context.OpenAlexInstitutions.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter))
        {
            var search = filter.Trim();

            query = query.Where(x => EF.Functions.ILike(x.DisplayName, $"%{search}%"));
        }

        long totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.DisplayName)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
