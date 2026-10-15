using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Domain.IRepositories;

public interface IOpenAlexInstitutionRepository
{
    Task<List<OpenAlexInstitution>> GetAllAsync(CancellationToken cancellationToken);
    Task AddRangeAsync(
        IEnumerable<OpenAlexInstitution> entities,
        CancellationToken cancellationToken
    );
    void UpdateRange(IEnumerable<OpenAlexInstitution> entities);
    void DeleteRange(IEnumerable<OpenAlexInstitution> entities);
    Task<(List<OpenAlexInstitution>, long)> SearchWithPaginationAsync(
        int take,
        int skip,
        string? filter,
        CancellationToken cancellationToken
    );
}
