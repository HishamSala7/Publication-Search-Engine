using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Domain.IRepositories;

public interface ICountryRepository
{
    Task<List<Country>> GetAllAsync(CancellationToken cancellationToken);
    Task AddRangeAsync(IEnumerable<Country> entities, CancellationToken cancellationToken);
    void UpdateRange(IEnumerable<Country> entities);
    void DeleteRange(IEnumerable<Country> entities);
    Task<(List<Country>,long)> SearchWithPaginationAsync(
        int take,
        int skip,
        string? filter,
        CancellationToken cancellationToken
    );
}
