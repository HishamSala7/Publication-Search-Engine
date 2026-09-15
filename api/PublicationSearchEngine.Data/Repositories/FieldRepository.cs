using Microsoft.EntityFrameworkCore;
using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Data.Repositories;

public class FieldRepository : IFieldRepository
{
    private readonly PublicationDbContext _context;

    public FieldRepository(PublicationDbContext context)
    {
        _context = context;
    }

    public async Task AddRangeAsync(
        IEnumerable<Field> entities,
        CancellationToken cancellationToken
    )
    {
        await _context.Fields.AddRangeAsync(entities, cancellationToken);
    }

    public async Task<List<Field>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.Fields.ToListAsync(cancellationToken);
    }

    public void UpdateRange(IEnumerable<Field> entities)
    {
        _context.Fields.UpdateRange(entities);
    }

    public void DeleteRange(IEnumerable<Field> entities)
    {
        _context.Fields.RemoveRange(entities);
    }

    public async Task<(List<Field>, long)> SearchWithPaginationAsync(
        int take,
        int skip,
        string? filter,
        CancellationToken cancellationToken
    )
    {
        var query = _context.Fields.AsNoTracking().AsQueryable();

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
