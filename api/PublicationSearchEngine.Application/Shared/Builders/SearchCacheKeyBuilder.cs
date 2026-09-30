using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using PublicationSearchEngine.Application.Interfaces;

namespace PublicationSearchEngine.Application.Shared.Builders;

public class SearchCacheKeyBuilder : ISearchCacheKeyBuilder
{
    public string Build<T>(string prefix, T request)
    {
        var json = JsonSerializer.Serialize(
            request,
            new JsonSerializerOptions
            {
                DefaultIgnoreCondition = System
                    .Text
                    .Json
                    .Serialization
                    .JsonIgnoreCondition
                    .WhenWritingNull,
            }
        );

        using var sha256 = SHA256.Create();

        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(json));

        var hash = Convert.ToHexString(hashBytes);

        return $"{prefix}:{hash}";
    }
}
