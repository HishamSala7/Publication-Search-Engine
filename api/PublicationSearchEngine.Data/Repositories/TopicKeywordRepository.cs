using Microsoft.EntityFrameworkCore;
using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Data.Repositories;

public class TopicKeywordRepository : ITopicKeywordRepository
{
    private readonly PublicationDbContext _context;

    public TopicKeywordRepository(PublicationDbContext context)
    {
        _context = context;
    }

    public async Task AddRangeAsync(
        IEnumerable<TopicKeyword> entities,
        CancellationToken cancellationToken
    )
    {
        await _context.TopicKeywords.AddRangeAsync(entities, cancellationToken);
    }

    public async Task<List<TopicKeyword>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.TopicKeywords.ToListAsync(cancellationToken);
    }

    public void UpdateRange(IEnumerable<TopicKeyword> entities)
    {
        _context.TopicKeywords.UpdateRange(entities);
    }

    public void DeleteRange(IEnumerable<TopicKeyword> entities)
    {
        _context.TopicKeywords.RemoveRange(entities);
    }
}
