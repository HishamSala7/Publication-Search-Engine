using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Data.Repositories;

public class FieldRepository : IFieldRepository
{
    private readonly PublicationDbContext _context;

    public FieldRepository(PublicationDbContext context)
    {
        _context = context;
    }
}
