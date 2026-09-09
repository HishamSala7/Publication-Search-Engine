using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Data.Repositories;

public class TopicRepository : ITopicRepository
{
    private readonly PublicationDbContext _context;

    public TopicRepository(PublicationDbContext context)
    {
        _context = context;
    }
}
