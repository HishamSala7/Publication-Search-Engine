using System.Net.Http.Json;
using PublicationSearchEngine.Application.DTOs;

namespace PublicationSearchEngine.Application.Services;

public class OpenAlexService
{
    private readonly HttpClient _httpClient;

    public OpenAlexService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<OpenAlexWork?> GetWorkByIdAsync(string workId, CancellationToken ct) =>
        await _httpClient.GetFromJsonAsync<OpenAlexWork>($"works/{workId}", ct);

    public async Task<OpenAlexResponse<OpenAlexWork>?> GetWorksPageAsync(
        string? authorId,
        string? search,
        string? cursor,
        int perPage,
        CancellationToken ct
    )
    {
        var filters = new List<string>();
        if (!string.IsNullOrWhiteSpace(authorId))
            filters.Add($"author.id:{authorId}");

        var queryParams = new List<string>
        {
            $"per-page={perPage}",
            $"cursor={Uri.EscapeDataString(cursor ?? "*")}",
        };

        if (filters.Count > 0)
            queryParams.Add($"filter={Uri.EscapeDataString(string.Join(",", filters))}");

        if (!string.IsNullOrWhiteSpace(search))
            queryParams.Add($"search={Uri.EscapeDataString(search)}");

        return await _httpClient.GetFromJsonAsync<OpenAlexResponse<OpenAlexWork>>(
            $"works?{string.Join("&", queryParams)}",
            ct
        );
    }

    public async Task<List<OpenAlexWork>> GetAllWorksByAuthorAsync(
        string authorId,
        CancellationToken ct
    )
    {
        var allWorks = new List<OpenAlexWork>();
        string? cursor = "*";

        while (cursor != null)
        {
            var page = await GetWorksPageAsync(authorId, null, cursor, perPage: 200, ct);
            if (page?.Results == null || page.Results.Count == 0)
                break;

            allWorks.AddRange(page.Results);
            cursor = page.Meta?.NextCursor;
        }

        return allWorks;
    }

    public async Task<OpenAlexInstitution?> GetInstitutionByRorAsync(
        string rorId,
        CancellationToken ct
    )
    {
        if (string.IsNullOrWhiteSpace(rorId))
            return null;

        var shortRor = rorId
            .Replace("https://ror.org/", "")
            .Replace("http://ror.org/", "")
            .TrimEnd('/');

        var url = $"institutions/ror:{shortRor}";

        try
        {
            return await _httpClient.GetFromJsonAsync<OpenAlexInstitution>(url, ct);
        }
        catch (HttpRequestException)
        {
            return null;
        }
    }

    public async Task<List<AuthorCandidate>> FindAuthorCandidatesAsync(
        string name,
        string? institutionId,
        CancellationToken ct
    )
    {
        var filters = new List<string> { $"display_name.search:{Uri.EscapeDataString(name)}" };

        if (!string.IsNullOrWhiteSpace(institutionId))
            filters.Add($"last_known_institutions.lineage:{institutionId}");

        var url = $"authors?filter={string.Join(",", filters)}&per-page=10";

        var httpResponse = await _httpClient.GetAsync(url, ct);
        if (!httpResponse.IsSuccessStatusCode)
        {
            var errorBody = await httpResponse.Content.ReadAsStringAsync(ct);
            throw new HttpRequestException(
                $"OpenAlex request failed ({httpResponse.StatusCode}).\nURL: {url}\nBody: {errorBody}"
            );
        }

        var response = await httpResponse.Content.ReadFromJsonAsync<
            OpenAlexResponse<OpenAlexAuthorDetail>
        >(cancellationToken: ct);

        var candidates =
            response
                ?.Results.Select(a => new AuthorCandidate
                {
                    OpenAlexId = a.Id!,
                    DisplayName = a.DisplayName!,
                    Orcid = a.Orcid,
                    Institution = a.LastKnownInstitutions?.FirstOrDefault()?.DisplayName,
                    WorksCount = a.WorksCount,
                    CitedByCount = a.CitedByCount,
                })
                .ToList() ?? new List<AuthorCandidate>();

        if (candidates.Count == 0 && !string.IsNullOrWhiteSpace(institutionId))
        {
            return await FindAuthorCandidatesAsync(name, institutionId: null, ct);
        }

        return candidates;
    }
}
