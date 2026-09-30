namespace PublicationSearchEngine.Application.Interfaces;

public interface ISearchCacheKeyBuilder
{
    string Build<T>(string prefix, T request);
}
