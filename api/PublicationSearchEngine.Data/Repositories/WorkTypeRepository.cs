using Microsoft.EntityFrameworkCore;
using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;
using PublicationSearchEngine.Domain.Shared.Enums;

namespace PublicationSearchEngine.Data.Repositories;

public class WorkTypeRepository : IWorkTypeRepository
{
    private readonly PublicationDbContext _context;

    public WorkTypeRepository(PublicationDbContext context)
    {
        _context = context;
    }

    public async Task AddRangeAsync(
        IEnumerable<WorkType> entities,
        CancellationToken cancellationToken
    )
    {
        await _context.WorkTypes.AddRangeAsync(entities, cancellationToken);
    }

    public async Task<List<WorkType>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.WorkTypes.ToListAsync(cancellationToken);
    }

    public void UpdateRange(IEnumerable<WorkType> entities)
    {
        _context.WorkTypes.UpdateRange(entities);
    }

    public void DeleteRange(IEnumerable<WorkType> entities)
    {
        _context.WorkTypes.RemoveRange(entities);
    }

    public async Task<List<WorkType>> GetByTypesAsync(
        IEnumerable<PublicationType> types,
        CancellationToken cancellationToken
    )
    {
        var typeList = types.Distinct().ToList();

        return await _context
            .WorkTypes.AsNoTracking()
            .Where(x => typeList.Contains(x.Type))
            .ToListAsync(cancellationToken);
    }
}
