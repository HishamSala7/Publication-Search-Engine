using Microsoft.EntityFrameworkCore;
using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Data.Repositories;

public class CountryRepository : ICountryRepository
{
    private readonly PublicationDbContext _context;

    public CountryRepository(PublicationDbContext context)
    {
        _context = context;
    }

    public async Task AddRangeAsync(
        IEnumerable<Country> entities,
        CancellationToken cancellationToken
    )
    {
        await _context.Countries.AddRangeAsync(entities, cancellationToken);
    }

    public async Task<List<Country>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.Countries.ToListAsync(cancellationToken);
    }

    public void UpdateRange(IEnumerable<Country> entities)
    {
        _context.Countries.UpdateRange(entities);
    }

    public void DeleteRange(IEnumerable<Country> entities)
    {
        _context.Countries.RemoveRange(entities);
    }

    public async Task<(List<Country>, long)> SearchWithPaginationAsync(
        int take,
        int skip,
        string? filter,
        CancellationToken cancellationToken
    )
    {
        var query = _context.Countries.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter))
        {
            var search = filter.Trim();

            query = query.Where(x => EF.Functions.ILike(x.DisplayName, $"%{search}%"));
        }

        long totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.DisplayName)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
