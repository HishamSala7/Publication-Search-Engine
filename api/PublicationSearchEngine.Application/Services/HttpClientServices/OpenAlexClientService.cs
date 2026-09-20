using System.Net.Http.Json;
using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Application.Shared.Consts;

namespace PublicationSearchEngine.Application.Services.HttpClientServices;

public class OpenAlexClientService
{
    private readonly HttpClient _httpClient;

    public OpenAlexClientService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<List<T>> GetAllAsync<T>(
        string openAlexEntity,
        List<(string? attribute, string? value)>? filters = null,
        List<(string? attribute, bool isDesc)>? sort = null,
        CancellationToken cancellationToken = default
    )
        where T : class
    {
        List<T> list = [];
        string? cursor = "*";

        while (cursor != null)
        {
            var page = await GetPageAsync<T>(
                openAlexEntity,
                OpenAlexConsts.PerPageMaxLimit,
                filters,
                sort,
                cursor,
                cancellationToken
            );

            if (page?.Results == null || page.Results.Count == 0)
                break;

            list.AddRange(page.Results);
            cursor = page.Meta?.NextCursor;
        }

        return list;
    }

    public async Task<OpenAlexResponse<T>?> GetPageAsync<T>(
        string entityName,
        int perPage,
        List<(string? attribute, string? value)>? filters = null,
        List<(string? attribute, bool isDesc)>? sort = null,
        string? cursor = "*",
        CancellationToken cancellationToken = default
    )
        where T : class
    {
        var url = BuildUrl(entityName, filters, sort, cursor, perPage);

        if (string.IsNullOrWhiteSpace(url))
            return null;

        using var response = await _httpClient.GetAsync(url, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        return await response.Content.ReadFromJsonAsync<OpenAlexResponse<T>>(cancellationToken);
    }

    public async Task<T?> GetFirstOrDefaultAsync<T>(
        string entityName,
        List<(string? attribute, string? value)>? filters = null,
        List<(string? attribute, bool isDesc)>? sort = null,
        string? cursor = "*",
        CancellationToken cancellationToken = default
    )
        where T : class
    {
        var url = BuildUrl(entityName, filters, sort, cursor, 1);

        if (string.IsNullOrWhiteSpace(url))
            return null;

        using var response = await _httpClient.GetAsync(url, cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        var responseData = await response.Content.ReadFromJsonAsync<OpenAlexResponse<T>>(
            cancellationToken
        );

        return responseData?.Results?.FirstOrDefault();
    }

    public async Task<T?> GetByIdAsync<T>(
        string entityName,
        string openAlexId,
        CancellationToken cancellationToken = default
    )
        where T : class
    {
        var url = BuildUrl(entityName, openAlexId);

        if (string.IsNullOrWhiteSpace(url))
            return null;

        using var response = await _httpClient.GetAsync(url, cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        var responseData = await response.Content.ReadFromJsonAsync<T>(cancellationToken);

        return responseData;
    }

    private static string? BuildUrl(
        string entityName,
        List<(string? attribute, string? value)>? filters,
        List<(string? attribute, bool isDesc)>? sort,
        string? cursor,
        int perPage
    )
    {
        if (string.IsNullOrWhiteSpace(entityName) || perPage <= 0)
            return null;

        cursor ??= "*";

        var queryParams = new List<string>
        {
            $"per-page={perPage}",
            $"cursor={Uri.EscapeDataString(cursor)}",
        };

        // filters
        var combinedFilters = filters
            ?.Where(x =>
                !string.IsNullOrWhiteSpace(x.attribute) && !string.IsNullOrWhiteSpace(x.value)
            )
            .Select(x => $"{x.attribute}:{x.value}")
            .ToList();

        if (combinedFilters?.Count > 0)
        {
            queryParams.Add($"filter={Uri.EscapeDataString(string.Join(",", combinedFilters))}");
        }

        // sort
        var combinedSort = sort
            ?.Where(x => !string.IsNullOrWhiteSpace(x.attribute))
            .Select(x => x.isDesc ? $"{x.attribute}:desc" : x.attribute!)
            .ToList();

        if (combinedSort?.Count > 0)
        {
            queryParams.Add($"sort={Uri.EscapeDataString(string.Join(",", combinedSort))}");
        }

        return $"{entityName}?{string.Join("&", queryParams)}";
    }

    private static string? BuildUrl(string entityName, string openAlexId)
    {
        if (string.IsNullOrWhiteSpace(entityName))
            return null;

        return $"{entityName}/{openAlexId}";
    }
}
