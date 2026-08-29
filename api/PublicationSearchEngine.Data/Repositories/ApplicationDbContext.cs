using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Data.Repositories;

public class ApplicationDbContext : IApplicationDbContext
{
    private readonly PublicationDbContext _context;

    public ApplicationDbContext(PublicationDbContext context)
    {
        _context = context;
    }

    public async Task CompleteAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
