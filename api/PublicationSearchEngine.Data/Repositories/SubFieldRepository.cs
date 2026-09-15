using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Data.Repositories;

public class SubFieldRepository : ISubFieldRepository
{
    private readonly PublicationDbContext _context;

    public SubFieldRepository(PublicationDbContext context)
    {
        _context = context;
    }

    public async Task AddRangeAsync(
        IEnumerable<SubField> entities,
        CancellationToken cancellationToken
    )
    {
        await _context.SubFields.AddRangeAsync(entities, cancellationToken);
    }

    public async Task<List<SubField>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.SubFields.ToListAsync(cancellationToken);
    }

    public void UpdateRange(IEnumerable<SubField> entities)
    {
        _context.SubFields.UpdateRange(entities);
    }

    public void DeleteRange(IEnumerable<SubField> entities)
    {
        _context.SubFields.RemoveRange(entities);
    }

    public async Task<SubField?> FirstOrDefaultAsync(
        Expression<Func<SubField, bool>>? predicate = null,
        CancellationToken cancellationToken = default
    )
    {
        return predicate is null
            ? await _context.SubFields.FirstOrDefaultAsync(cancellationToken)
            : await _context.SubFields.FirstOrDefaultAsync(predicate, cancellationToken);
    }

    public async Task<(List<SubField>, long)> SearchWithPaginationAsync(
        List<Guid> fieldIds,
        int take,
        int skip,
        string? filter,
        CancellationToken cancellationToken
    )
    {
        fieldIds ??= [];

        var query = _context.SubFields.AsNoTracking().AsQueryable();

        if (fieldIds.Count > 0)
            query = query.Where(x => x.FieldId.HasValue && fieldIds.Contains(x.FieldId.Value));

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
