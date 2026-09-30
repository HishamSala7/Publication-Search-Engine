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
        List<OpenAlexFilter>? filters = null,
        List<OpenAlexSort>? sort = null,
        List<string>? select = null,
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
                select,
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
        List<OpenAlexFilter>? filters = null,
        List<OpenAlexSort>? sort = null,
        List<string>? select = null,
        string? cursor = "*",
        CancellationToken cancellationToken = default
    )
        where T : class
    {
        var url = BuildUrl(entityName, filters, sort, select, cursor, perPage);

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
        List<OpenAlexFilter>? filters = null,
        List<OpenAlexSort>? sort = null,
        List<string>? select = null,
        string? cursor = "*",
        CancellationToken cancellationToken = default
    )
        where T : class
    {
        var url = BuildUrl(entityName, filters, sort, select, cursor, 1);

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
        List<string>? select = null,
        CancellationToken cancellationToken = default
    )
        where T : class
    {
        var url = BuildUrl(entityName, openAlexId, select);

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
        List<OpenAlexFilter>? filters,
        List<OpenAlexSort>? sort,
        List<string>? select,
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

        var combinedFilters = filters
            ?.Where(x =>
                !string.IsNullOrWhiteSpace(x.Attribute) && !string.IsNullOrWhiteSpace(x.Value)
            )
            .Select(x => $"{x.Attribute}:{x.Value}")
            .ToList();

        if (combinedFilters?.Count > 0)
        {
            queryParams.Add(
                $"filter={Uri.EscapeDataString(
                    string.Join(",", combinedFilters)
                )}"
            );
        }

        var combinedSort = sort
            ?.Where(x => !string.IsNullOrWhiteSpace(x.Attribute))
            .Select(x => x.IsDescending ? $"{x.Attribute}:desc" : x.Attribute)
            .ToList();

        if (combinedSort?.Count > 0)
        {
            queryParams.Add(
                $"sort={Uri.EscapeDataString(
                    string.Join(",", combinedSort)
                )}"
            );
        }

        if (select?.Count > 0)
        {
            queryParams.Add(
                $"select={Uri.EscapeDataString(
                    string.Join(",", select)
                )}"
            );
        }

        return $"{entityName}?{string.Join("&", queryParams)}";
    }

    private static string? BuildUrl(string entityName, string openAlexId, List<string>? select)
    {
        if (string.IsNullOrWhiteSpace(entityName))
            return null;

        if (select?.Count > 0)
        {
            return $"{entityName}/{openAlexId}?select={Uri.EscapeDataString(
                string.Join(",", select)
            )}";
        }

        return $"{entityName}/{openAlexId}";
    }
}
