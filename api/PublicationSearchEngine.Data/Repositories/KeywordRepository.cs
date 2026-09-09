using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Data.Repositories;

public class KeywordRepository : IKeywordRepository
{
    private readonly PublicationDbContext _context;

    public KeywordRepository(PublicationDbContext context)
    {
        _context = context;
    }
}
