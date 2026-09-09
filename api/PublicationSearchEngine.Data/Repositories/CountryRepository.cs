using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Data.Repositories;

public class CountryRepository : ICountryRepository
{
    private readonly PublicationDbContext _context;

    public CountryRepository(PublicationDbContext context)
    {
        _context = context;
    }
}
