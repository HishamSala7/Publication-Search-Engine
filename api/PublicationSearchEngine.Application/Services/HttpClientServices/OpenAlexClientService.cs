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
        string entityName,
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
                entityName,
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

    public async Task<List<OpenAlexGroupByItem>> GetAllGroupedAsync(
        string entityName,
        string attribute,
        bool includeUnknown = false,
        List<OpenAlexFilter>? filters = null,
        CancellationToken cancellationToken = default
    )
    {
        List<OpenAlexGroupByItem> groups = [];

        string? cursor = "*";

        while (cursor != null)
        {
            var page = await GetGroupedPageAsync(
                entityName,
                attribute,
                includeUnknown,
                filters,
                cursor,
                cancellationToken
            );

            if (page?.GroupBy == null || page.GroupBy.Count == 0)
                break;

            groups.AddRange(page.GroupBy);

            cursor = page.Meta?.NextCursor;
        }

        return groups;
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

    public async Task<OpenAlexGroupByResponse?> GetGroupedPageAsync(
        string entityName,
        string attribute,
        bool includeUnknown = false,
        List<OpenAlexFilter>? filters = null,
        string? cursor = "*",
        CancellationToken cancellationToken = default
    )
    {
        var url = BuildUrl(
            entityName,
            filters,
            attribute,
            includeUnknown,
            cursor,
            OpenAlexConsts.PerPageMaxLimit
        );

        if (string.IsNullOrWhiteSpace(url))
            return null;

        using var response = await _httpClient.GetAsync(url, cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<OpenAlexGroupByResponse>(cancellationToken);
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

    private string? BuildUrl(
        string entityName,
        List<OpenAlexFilter>? filters,
        string attribute,
        bool includeUnknown,
        string? cursor,
        int perPage
    )
    {
        if (
            string.IsNullOrWhiteSpace(entityName)
            || string.IsNullOrWhiteSpace(attribute)
            || perPage <= 0
        )
            return null;

        cursor ??= "*";

        var queryParams = new List<string>
        {
            $"per-page={perPage}",
            $"cursor={Uri.EscapeDataString(cursor)}",
        };

        AddFilterQueryParameter(queryParams, filters);

        AddGroupByQueryParameter(queryParams, attribute, includeUnknown);

        return $"{entityName}?{string.Join("&", queryParams)}";
    }

    private string? BuildUrl(
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

        AddFilterQueryParameter(queryParams, filters);

        AddSortQueryParameter(queryParams, sort);

        AddSelectQueryParameter(queryParams, select);

        return $"{entityName}?{string.Join("&", queryParams)}";
    }

    private string? BuildUrl(string entityName, string openAlexId, List<string>? select)
    {
        if (string.IsNullOrWhiteSpace(entityName) || string.IsNullOrWhiteSpace(openAlexId))
            return null;

        if (select?.Count > 0)
        {
            return $"{entityName}/{openAlexId}?select={Uri.EscapeDataString(
                string.Join(",", select)
            )}";
        }

        return $"{entityName}/{openAlexId}";
    }

    private void AddFilterQueryParameter(List<string> queryParams, List<OpenAlexFilter>? filters)
    {
        var combinedFilters = filters
            ?.Where(x =>
                !string.IsNullOrWhiteSpace(x.Attribute) && !string.IsNullOrWhiteSpace(x.Value)
            )
            .Select(x => $"{x.Attribute}:{x.Value}")
            .ToList();

        if (combinedFilters == null || combinedFilters.Count == 0)
            return;

        queryParams.Add(
            $"filter={Uri.EscapeDataString(
                string.Join(",", combinedFilters)
            )}"
        );
    }

    private void AddSortQueryParameter(List<string> queryParams, List<OpenAlexSort>? sort)
    {
        var combinedSort = sort
            ?.Where(x => !string.IsNullOrWhiteSpace(x.Attribute))
            .Select(x => x.IsDescending ? $"{x.Attribute}:desc" : x.Attribute)
            .ToList();

        if (combinedSort == null || combinedSort.Count == 0)
            return;

        queryParams.Add(
            $"sort={Uri.EscapeDataString(
                string.Join(",", combinedSort)
            )}"
        );
    }

    private void AddSelectQueryParameter(List<string> queryParams, List<string>? select)
    {
        var validSelects = select
            ?.Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (validSelects == null || validSelects.Count == 0)
            return;

        queryParams.Add(
            $"select={Uri.EscapeDataString(
                string.Join(",", validSelects)
            )}"
        );
    }

    private static void AddGroupByQueryParameter(
        List<string> queryParams,
        string attribute,
        bool includeUnknown = false
    )
    {
        if (string.IsNullOrWhiteSpace(attribute))
            return;

        var value = includeUnknown ? $"{attribute}:include_unknown" : attribute;

        queryParams.Add($"group_by={Uri.EscapeDataString(value)}");
    }
}
