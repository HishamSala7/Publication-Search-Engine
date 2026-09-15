using Microsoft.EntityFrameworkCore;
using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Data.Repositories;

public class KeywordRepository : IKeywordRepository
{
    private readonly PublicationDbContext _context;

    public KeywordRepository(PublicationDbContext context)
    {
        _context = context;
    }

    public async Task AddRangeAsync(
        IEnumerable<Keyword> entities,
        CancellationToken cancellationToken
    )
    {
        await _context.Keywords.AddRangeAsync(entities, cancellationToken);
    }

    public async Task<List<Keyword>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.Keywords.ToListAsync(cancellationToken);
    }

    public void UpdateRange(IEnumerable<Keyword> entities)
    {
        _context.Keywords.UpdateRange(entities);
    }

    public void DeleteRange(IEnumerable<Keyword> entities)
    {
        _context.Keywords.RemoveRange(entities);
    }

    public async Task<(List<Keyword>, long)> SearchWithPaginationAsync(
        List<Guid> fieldIds,
        List<Guid> subfieldIds,
        List<Guid> topicIds,
        int take,
        int skip,
        string? filter,
        CancellationToken cancellationToken
    )
    {
        subfieldIds ??= [];
        fieldIds ??= [];
        topicIds ??= [];

        var query = _context.Keywords.AsNoTracking().AsQueryable();

        if (topicIds.Count > 0)
            query = query.Where(x => x.TopicKeywords.Any(y => topicIds.Contains(y.TopicId)));

        if (subfieldIds.Count > 0)
            query = query.Where(x =>
                x.TopicKeywords.Any(tk =>
                    tk.Topic != null
                    && tk.Topic.SubFieldId.HasValue
                    && subfieldIds.Contains(tk.Topic.SubFieldId.Value)
                )
            );

        if (fieldIds.Count > 0)
            query = query.Where(x =>
                x.TopicKeywords.Any(tk =>
                    tk.Topic != null
                    && tk.Topic.SubField != null
                    && tk.Topic.SubField.FieldId.HasValue
                    && fieldIds.Contains(tk.Topic.SubField.FieldId.Value)
                )
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
