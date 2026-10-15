using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.Shared.Enums;

namespace PublicationSearchEngine.Domain.IRepositories;

public interface IWorkTypeRepository
{
    Task<List<WorkType>> GetAllAsync(CancellationToken cancellationToken);
    Task<List<WorkType>> GetByTypesAsync(
        IEnumerable<PublicationType> types,
        CancellationToken cancellationToken
    );
    Task AddRangeAsync(IEnumerable<WorkType> entities, CancellationToken cancellationToken);
    void UpdateRange(IEnumerable<WorkType> entities);
    void DeleteRange(IEnumerable<WorkType> entities);
}
