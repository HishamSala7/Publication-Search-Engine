using System.Net.Http.Json;
using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Application.Services;

public class OpenAlexSyncService
{
    private readonly HttpClient _httpClient;
    private static readonly SemaphoreSlim _syncLock = new(1, 1);
    private readonly IApplicationDbContext _context;
    private readonly ICountryRepository _countryRepository;
    private readonly IFieldRepository _fieldRepository;
    private readonly IKeywordRepository _keywordRepository;
    private readonly ISubFieldRepository _subFieldRepository;
    private readonly ITopicRepository _topicRepository;
    private readonly ITopicKeywordRepository _topicKeywordRepository;

    public OpenAlexSyncService(
        HttpClient httpClient,
        IApplicationDbContext context,
        ICountryRepository countryRepository,
        IFieldRepository fieldRepository,
        IKeywordRepository keywordRepository,
        ISubFieldRepository subFieldRepository,
        ITopicRepository topicRepository,
        ITopicKeywordRepository topicKeywordRepository
    )
    {
        _httpClient = httpClient;
        _context = context;
        _countryRepository = countryRepository;
        _fieldRepository = fieldRepository;
        _keywordRepository = keywordRepository;
        _subFieldRepository = subFieldRepository;
        _topicRepository = topicRepository;
        _topicKeywordRepository = topicKeywordRepository;
    }

    public virtual async Task SyncCountriesAsync(CancellationToken cancellationToken)
    {
        var syncTime = DateTime.UtcNow;

        var allCountries = await GetAllOpenAlexCountriesAsync(cancellationToken);

        var existingCountries = await _countryRepository.GetAllAsync(cancellationToken);

        var existingLookup = existingCountries.ToDictionary(x => x.OpenAlexId);

        var openAlexIds = allCountries
            .Select(x => x.Id?.Split("/").Last())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToHashSet();

        var toAdd = new List<Country>();
        var toUpdate = new List<Country>();

        foreach (var country in allCountries)
        {
            var openAlexId = country.Id?.Split("/").Last() ?? string.Empty;

            if (existingLookup.TryGetValue(openAlexId, out var match))
            {
                match.DisplayName = country.DisplayName ?? string.Empty;
                match.Continent = country.Continent?.DisplayName ?? string.Empty;
                match.WorksCount = country.WorksCount ?? 0;
                match.CountryCodeAlphaThree = country.CountryCodeAlphaThree ?? string.Empty;
                match.CountryCodeAlphaTwo = country.CountryCodeAlphaTwo ?? string.Empty;
                match.SyncedAt = syncTime;

                toUpdate.Add(match);

                continue;
            }

            toAdd.Add(
                new Country
                {
                    Id = Guid.NewGuid(),
                    OpenAlexId = openAlexId,
                    DisplayName = country.DisplayName ?? string.Empty,
                    Continent = country.Continent?.DisplayName ?? string.Empty,
                    WorksCount = country.WorksCount ?? 0,
                    CountryCodeAlphaThree = country.CountryCodeAlphaThree ?? string.Empty,
                    CountryCodeAlphaTwo = country.CountryCodeAlphaTwo ?? string.Empty,
                    SyncedAt = syncTime,
                }
            );
        }

        var toDelete = existingCountries.Where(x => !openAlexIds.Contains(x.OpenAlexId)).ToList();

        await _countryRepository.AddRangeAsync(toAdd, cancellationToken);

        _countryRepository.UpdateRange(toUpdate);

        _countryRepository.DeleteRange(toDelete);

        await _context.CompleteAsync(cancellationToken);
    }

    public async Task SyncFieldsAsync(CancellationToken cancellationToken)
    {
        var syncTime = DateTime.UtcNow;

        var allFields = await GetAllOpenAlexFieldsAsync(cancellationToken);

        var existingFields = await _fieldRepository.GetAllAsync(cancellationToken);

        var existingLookup = existingFields.ToDictionary(x => x.OpenAlexId);

        var openAlexIds = allFields
            .Select(x => x.Id?.Split("/").Last())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToHashSet();

        var toAdd = new List<Field>();
        var toUpdate = new List<Field>();

        foreach (var field in allFields)
        {
            var openAlexId = field.Id?.Split("/").Last() ?? string.Empty;

            if (existingLookup.TryGetValue(openAlexId, out var match))
            {
                match.DisplayName = field.DisplayName ?? string.Empty;
                match.WorksCount = field.WorksCount ?? 0;
                match.SyncedAt = syncTime;

                toUpdate.Add(match);

                continue;
            }

            toAdd.Add(
                new Field
                {
                    Id = Guid.NewGuid(),
                    OpenAlexId = openAlexId,
                    DisplayName = field.DisplayName ?? string.Empty,
                    WorksCount = field.WorksCount ?? 0,
                    SyncedAt = syncTime,
                }
            );
        }

        var toDelete = existingFields.Where(x => !openAlexIds.Contains(x.OpenAlexId)).ToList();

        await _fieldRepository.AddRangeAsync(toAdd, cancellationToken);

        _fieldRepository.UpdateRange(toUpdate);

        _fieldRepository.DeleteRange(toDelete);

        await _context.CompleteAsync(cancellationToken);
    }

    public async Task SyncSubfieldsAsync(CancellationToken cancellationToken)
    {
        var syncTime = DateTime.UtcNow;

        var allSubFields = await GetAllOpenAlexSubfieldsAsync(cancellationToken);

        var fields = await _fieldRepository.GetAllAsync(cancellationToken);

        var existingSubFields = await _subFieldRepository.GetAllAsync(cancellationToken);

        var existingLookup = existingSubFields.ToDictionary(x => x.OpenAlexId);

        var openAlexIds = allSubFields
            .Select(x => x.Id?.Split("/").Last())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToHashSet();

        var toAdd = new List<SubField>();
        var toUpdate = new List<SubField>();

        foreach (var subfield in allSubFields)
        {
            var openAlexId = subfield.Id?.Split("/").Last() ?? string.Empty;

            var parentField = fields.FirstOrDefault(f =>
                f.OpenAlexId == subfield.Field?.Id?.Split("/").Last()
            );

            if (existingLookup.TryGetValue(openAlexId, out var match))
            {
                match.DisplayName = subfield.DisplayName ?? string.Empty;
                match.WorksCount = subfield.WorksCount ?? 0;
                match.FieldId = parentField?.Id ?? Guid.Empty;
                match.SyncedAt = syncTime;

                toUpdate.Add(match);

                continue;
            }

            toAdd.Add(
                new SubField
                {
                    Id = Guid.NewGuid(),
                    OpenAlexId = openAlexId,
                    DisplayName = subfield.DisplayName ?? string.Empty,
                    WorksCount = subfield.WorksCount ?? 0,
                    FieldId = parentField?.Id ?? Guid.Empty,
                    SyncedAt = syncTime,
                }
            );
        }

        var toDelete = existingSubFields.Where(x => !openAlexIds.Contains(x.OpenAlexId)).ToList();

        await _subFieldRepository.AddRangeAsync(toAdd, cancellationToken);

        _subFieldRepository.UpdateRange(toUpdate);

        _subFieldRepository.DeleteRange(toDelete);

        await _context.CompleteAsync(cancellationToken);
    }

    public async Task SyncTopicsAsync(CancellationToken cancellationToken)
    {
        await _syncLock.WaitAsync(cancellationToken);

        try
        {
            var syncTime = DateTime.UtcNow;

            var allTopics = await GetAllOpenAlexTopicsAsync(cancellationToken);

            var allKeywords = await GetAllOpenAlexKeywordsAsync(cancellationToken);

            var subFields = await _subFieldRepository.GetAllAsync(cancellationToken);

            var existingTopics = await _topicRepository.GetAllAsync(cancellationToken);

            var existingKeywords = await _keywordRepository.GetAllAsync(cancellationToken);

            var existingTopicKeywords = await _topicKeywordRepository.GetAllAsync(
                cancellationToken
            );

            var subFieldLookup = subFields.ToDictionary(x => x.OpenAlexId);

            var topicsLookup = existingTopics.ToDictionary(x => x.OpenAlexId);

            var keywordsLookup = existingKeywords.ToDictionary(x => x.OpenAlexId);

            var topicKeywordLookup = existingTopicKeywords.ToDictionary(x =>
                $"{x.TopicId}_{x.KeywordId}"
            );

            var allKeywordsLookup = allKeywords
                .Where(x =>
                    !string.IsNullOrWhiteSpace(x.Id) && !string.IsNullOrWhiteSpace(x.DisplayName)
                )
                .GroupBy(x => x.Id!.Split("/").Last())
                .ToDictionary(x => x.Key, x => x.First());

            var openAlexKeywordLookup = allKeywords
                .Where(x =>
                    !string.IsNullOrWhiteSpace(x.Id) && !string.IsNullOrWhiteSpace(x.DisplayName)
                )
                .GroupBy(x => x.DisplayName!.Trim().ToLower())
                .ToDictionary(x => x.Key, x => x.First().Id!.Split("/").Last());

            var topicsToAdd = new List<Topic>();

            var keywordsToAdd = new List<Keyword>();

            var topicKeywordsToAdd = new List<TopicKeyword>();

            var syncedTopicIds = new HashSet<string>();

            var syncedKeywordIds = new HashSet<string>();

            var syncedTopicKeywordIds = new HashSet<string>();

            foreach (var openAlexTopic in allTopics)
            {
                var topicOpenAlexId = openAlexTopic.Id?.Split("/").Last();

                if (string.IsNullOrWhiteSpace(topicOpenAlexId))
                    continue;

                syncedTopicIds.Add(topicOpenAlexId);

                var subFieldOpenAlexId = openAlexTopic.SubField?.Id?.Split("/").Last();

                subFieldLookup.TryGetValue(subFieldOpenAlexId ?? string.Empty, out var subField);

                Topic topic;

                if (topicsLookup.TryGetValue(topicOpenAlexId, out var existingTopic))
                {
                    topic = existingTopic;

                    topic.DisplayName = openAlexTopic.DisplayName ?? string.Empty;
                    topic.WorksCount = openAlexTopic.WorksCount ?? 0;
                    topic.SubFieldId = subField?.Id ?? Guid.Empty;
                    topic.SyncedAt = syncTime;
                }
                else
                {
                    topic = new Topic
                    {
                        Id = Guid.NewGuid(),
                        OpenAlexId = topicOpenAlexId,
                        DisplayName = openAlexTopic.DisplayName ?? string.Empty,
                        WorksCount = openAlexTopic.WorksCount ?? 0,
                        SubFieldId = subField?.Id ?? Guid.Empty,
                        SyncedAt = syncTime,
                    };

                    topicsToAdd.Add(topic);

                    topicsLookup.Add(topicOpenAlexId, topic);
                }

                foreach (var keywordValue in openAlexTopic.Keywords ?? [])
                {
                    if (string.IsNullOrWhiteSpace(keywordValue))
                        continue;

                    var keywordName = keywordValue.Trim().ToLower();

                    if (!openAlexKeywordLookup.TryGetValue(keywordName, out var keywordOpenAlexId))
                        continue;

                    syncedKeywordIds.Add(keywordOpenAlexId);

                    Keyword keyword;

                    if (keywordsLookup.TryGetValue(keywordOpenAlexId, out var existingKeyword))
                    {
                        keyword = existingKeyword;

                        keyword.DisplayName = keywordValue.Trim();

                        if (
                            allKeywordsLookup.TryGetValue(
                                keywordOpenAlexId,
                                out var openAlexKeyword
                            )
                        )
                            keyword.WorksCount = openAlexKeyword.WorksCount ?? 0;

                        keyword.SyncedAt = syncTime;
                    }
                    else
                    {
                        keyword = new Keyword
                        {
                            Id = Guid.NewGuid(),
                            OpenAlexId = keywordOpenAlexId,
                            DisplayName = keywordValue.Trim(),

                            WorksCount = allKeywordsLookup.TryGetValue(
                                keywordOpenAlexId,
                                out var openAlexKeyword
                            )
                                ? openAlexKeyword.WorksCount ?? 0
                                : 0,

                            SyncedAt = syncTime,
                        };

                        keywordsToAdd.Add(keyword);

                        keywordsLookup.Add(keywordOpenAlexId, keyword);
                    }

                    var relationKey = $"{topic.Id}_{keyword.Id}";

                    if (
                        syncedTopicKeywordIds.Add(relationKey)
                        && !topicKeywordLookup.ContainsKey(relationKey)
                    )
                        topicKeywordsToAdd.Add(
                            new TopicKeyword
                            {
                                Id = Guid.NewGuid(),
                                TopicId = topic.Id,
                                KeywordId = keyword.Id,
                            }
                        );
                }
            }

            var topicKeywordsToDelete = existingTopicKeywords
                .Where(x => !syncedTopicKeywordIds.Contains($"{x.TopicId}_{x.KeywordId}"))
                .ToList();

            var keywordsToDelete = existingKeywords
                .Where(x => !syncedKeywordIds.Contains(x.OpenAlexId))
                .ToList();

            var topicsToDelete = existingTopics
                .Where(x => !syncedTopicIds.Contains(x.OpenAlexId))
                .ToList();

            topicsToDelete.RemoveAll(x => topicsToAdd.Any(y => y.Id == x.Id));

            keywordsToDelete.RemoveAll(x => keywordsToAdd.Any(y => y.Id == x.Id));

            // Delete relations first because FK restriction

            if (topicKeywordsToDelete.Count > 0)
                _topicKeywordRepository.DeleteRange(topicKeywordsToDelete);

            if (keywordsToDelete.Count > 0)
                _keywordRepository.DeleteRange(keywordsToDelete);

            if (topicsToDelete.Count > 0)
                _topicRepository.DeleteRange(topicsToDelete);

            // Insert new records

            if (topicsToAdd.Count > 0)
                await _topicRepository.AddRangeAsync(topicsToAdd, cancellationToken);

            if (keywordsToAdd.Count > 0)
                await _keywordRepository.AddRangeAsync(keywordsToAdd, cancellationToken);

            if (topicKeywordsToAdd.Count > 0)
                await _topicKeywordRepository.AddRangeAsync(topicKeywordsToAdd, cancellationToken);

            await _context.CompleteAsync(cancellationToken);
        }
        finally
        {
            _syncLock.Release();
        }
    }

    private async Task<List<OpenAlexCountryDto>> GetAllOpenAlexCountriesAsync(
        CancellationToken cancellationToken
    )
    {
        List<OpenAlexCountryDto> allCountries = [];
        string? cursor = "*";

        while (cursor != null)
        {
            var page = await GetPageAsync<OpenAlexCountryDto>(
                100,
                cursor,
                "countries",
                cancellationToken
            );
            if (page?.Results == null || page.Results.Count == 0)
                break;

            allCountries.AddRange(page.Results);
            cursor = page.Meta?.NextCursor;
        }

        return allCountries;
    }

    private async Task<List<OpenAlexFieldDto>> GetAllOpenAlexFieldsAsync(
        CancellationToken cancellationToken
    )
    {
        List<OpenAlexFieldDto> allFields = [];
        string? cursor = "*";

        while (cursor != null)
        {
            var page = await GetPageAsync<OpenAlexFieldDto>(
                100,
                cursor,
                "fields",
                cancellationToken
            );
            if (page?.Results == null || page.Results.Count == 0)
                break;

            allFields.AddRange(page.Results);
            cursor = page.Meta?.NextCursor;
        }

        return allFields;
    }

    private async Task<List<OpenAlexSubfieldDto>> GetAllOpenAlexSubfieldsAsync(
        CancellationToken cancellationToken
    )
    {
        List<OpenAlexSubfieldDto> allSubfields = [];
        string? cursor = "*";

        while (cursor != null)
        {
            var page = await GetPageAsync<OpenAlexSubfieldDto>(
                100,
                cursor,
                "subfields",
                cancellationToken
            );
            if (page?.Results == null || page.Results.Count == 0)
                break;

            allSubfields.AddRange(page.Results);
            cursor = page.Meta?.NextCursor;
        }

        return allSubfields;
    }

    private async Task<List<OpenAlexTopicDto>> GetAllOpenAlexTopicsAsync(
        CancellationToken cancellationToken
    )
    {
        List<OpenAlexTopicDto> allTopics = [];
        string? cursor = "*";

        while (cursor != null)
        {
            var page = await GetPageAsync<OpenAlexTopicDto>(
                100,
                cursor,
                "topics",
                cancellationToken
            );
            if (page?.Results == null || page.Results.Count == 0)
                break;

            allTopics.AddRange(page.Results);
            cursor = page.Meta?.NextCursor;
        }

        return allTopics;
    }

    private async Task<List<OpenAlexKeywordDto>> GetAllOpenAlexKeywordsAsync(
        CancellationToken cancellationToken
    )
    {
        List<OpenAlexKeywordDto> allKeywords = [];
        string? cursor = "*";

        while (cursor != null)
        {
            var page = await GetPageAsync<OpenAlexKeywordDto>(
                100,
                cursor,
                "keywords",
                cancellationToken
            );
            if (page?.Results == null || page.Results.Count == 0)
                break;

            allKeywords.AddRange(page.Results);
            cursor = page.Meta?.NextCursor;
        }

        return allKeywords;
    }

    private async Task<OpenAlexResponse<T>?> GetPageAsync<T>(
        int perPage,
        string? cursor,
        string openAlexEntity,
        CancellationToken cancellationToken
    )
        where T : class
    {
        var queryParams = new List<string>
        {
            $"per-page={perPage}",
            $"cursor={Uri.EscapeDataString(cursor ?? "*")}",
        };

        return await _httpClient.GetFromJsonAsync<OpenAlexResponse<T>>(
            $"{openAlexEntity}?{string.Join("&", queryParams)}",
            cancellationToken
        );
    }
}
