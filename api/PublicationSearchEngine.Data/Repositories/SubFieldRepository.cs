using Microsoft.EntityFrameworkCore;
using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Data.Repositories;

public class SubFieldRepository : ISubFieldRepository
{
    private readonly PublicationDbContext _context;

    public SubFieldRepository(PublicationDbContext context)
    {
        _context = context;
    }

    public async Task AddRangeAsync(
        IEnumerable<SubField> entities,
        CancellationToken cancellationToken
    )
    {
        await _context.SubFields.AddRangeAsync(entities, cancellationToken);
    }

    public async Task<List<SubField>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.SubFields.ToListAsync(cancellationToken);
    }

    public void UpdateRange(IEnumerable<SubField> entities)
    {
        _context.SubFields.UpdateRange(entities);
    }

    public void DeleteRange(IEnumerable<SubField> entities)
    {
        _context.SubFields.RemoveRange(entities);
    }
}
