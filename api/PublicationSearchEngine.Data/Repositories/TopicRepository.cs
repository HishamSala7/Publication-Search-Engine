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
}
