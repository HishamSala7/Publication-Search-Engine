using Microsoft.EntityFrameworkCore;
using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Data.Repositories;

public class FieldRepository : IFieldRepository
{
    private readonly PublicationDbContext _context;

    public FieldRepository(PublicationDbContext context)
    {
        _context = context;
    }

    public async Task AddRangeAsync(
        IEnumerable<Field> entities,
        CancellationToken cancellationToken
    )
    {
        await _context.Fields.AddRangeAsync(entities, cancellationToken);
    }

    public async Task<List<Field>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.Fields.ToListAsync(cancellationToken);
    }

    public void UpdateRange(IEnumerable<Field> entities)
    {
        _context.Fields.UpdateRange(entities);
    }

    public void DeleteRange(IEnumerable<Field> entities)
    {
        _context.Fields.RemoveRange(entities);
    }
}
