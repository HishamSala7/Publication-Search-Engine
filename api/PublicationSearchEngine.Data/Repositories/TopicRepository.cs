using Microsoft.EntityFrameworkCore;
using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Data.Repositories;

public class TopicRepository : ITopicRepository
{
    private readonly PublicationDbContext _context;

    public TopicRepository(PublicationDbContext context)
    {
        _context = context;
    }

    public async Task AddRangeAsync(
        IEnumerable<Topic> entities,
        CancellationToken cancellationToken
    )
    {
        await _context.Topics.AddRangeAsync(entities, cancellationToken);
    }

    public async Task<List<Topic>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.Topics.ToListAsync(cancellationToken);
    }

    public void UpdateRange(IEnumerable<Topic> entities)
    {
        _context.Topics.UpdateRange(entities);
    }

    public void DeleteRange(IEnumerable<Topic> entities)
    {
        _context.Topics.RemoveRange(entities);
    }

    public async Task<(List<Topic>, long)> SearchWithPaginationAsync(
        List<Guid> fieldIds,
        List<Guid> subfieldIds,
        int take,
        int skip,
        string? filter,
        CancellationToken cancellationToken
    )
    {
        subfieldIds ??= [];
        fieldIds ??= [];

        var query = _context.Topics.AsNoTracking().AsQueryable();

        if (subfieldIds.Count > 0)
            query = query.Where(x =>
                x.SubFieldId.HasValue && subfieldIds.Contains(x.SubFieldId.Value)
            );

        if (fieldIds.Count > 0)
            query = query.Where(x =>
                x.SubField != null
                && x.SubField.FieldId.HasValue
                && fieldIds.Contains(x.SubField.FieldId.Value)
            );

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
