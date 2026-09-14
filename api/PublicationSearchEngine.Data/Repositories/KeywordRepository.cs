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
}
