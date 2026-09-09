using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Data.Repositories;

public class SubFieldRepository : ISubFieldRepository
{
    private readonly PublicationDbContext _context;

    public SubFieldRepository(PublicationDbContext context)
    {
        _context = context;
    }
}
