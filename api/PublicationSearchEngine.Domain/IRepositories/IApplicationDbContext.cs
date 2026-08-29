namespace PublicationSearchEngine.Domain.IRepositories;

public interface IApplicationDbContext
{
    Task CompleteAsync(CancellationToken cancellationToken);
}
