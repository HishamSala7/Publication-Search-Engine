using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Application.Services.HttpClientServices;
using PublicationSearchEngine.Application.Shared.Keys;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Application.Services;

public class OpenAlexSyncService
{
    private readonly OpenAlexClientService _openAlexClientService;
    private readonly IApplicationDbContext _context;
    private readonly ICountryRepository _countryRepository;
    private readonly IFieldRepository _fieldRepository;
    private readonly IKeywordRepository _keywordRepository;
    private readonly ISubFieldRepository _subFieldRepository;
    private readonly ITopicRepository _topicRepository;
    private readonly ITopicKeywordRepository _topicKeywordRepository;

    public OpenAlexSyncService(
        OpenAlexClientService openAlexClientService,
        IApplicationDbContext context,
        ICountryRepository countryRepository,
        IFieldRepository fieldRepository,
        IKeywordRepository keywordRepository,
        ISubFieldRepository subFieldRepository,
        ITopicRepository topicRepository,
        ITopicKeywordRepository topicKeywordRepository
    )
    {
        _openAlexClientService = openAlexClientService;
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

        var allCountries = await _openAlexClientService.GetAllAsync<OpenAlexCountryDto>(
            OpenAlexEntityKeys.Countries,
            null,
            null,
            null,
            cancellationToken
        );

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

        var allFields = await _openAlexClientService.GetAllAsync<OpenAlexFieldDto>(
            OpenAlexEntityKeys.Fields,
            null,
            null,
            null,
            cancellationToken
        );

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

        var allSubFields = await _openAlexClientService.GetAllAsync<OpenAlexSubfieldDto>(
            OpenAlexEntityKeys.SubFields,
            null,
            null,
            null,
            cancellationToken
        );

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
        var syncTime = DateTime.UtcNow;

        var allTopics = await _openAlexClientService.GetAllAsync<OpenAlexTopicDto>(
            OpenAlexEntityKeys.Topics,
            null,
            null,
            null,
            cancellationToken
        );

        var existingTopics = await _topicRepository.GetAllAsync(cancellationToken);

        var existingKeywords = await _keywordRepository.GetAllAsync(cancellationToken);

        var existingTopicKeywords = await _topicKeywordRepository.GetAllAsync(cancellationToken);

        var topicsLookup = existingTopics.ToDictionary(x => x.OpenAlexId);

        var keywordsLookup = existingKeywords.ToDictionary(x => x.OpenAlexId);

        var topicKeywordLookup = existingTopicKeywords.ToDictionary(x =>
            $"{x.TopicId}_{x.KeywordId}"
        );

        var keywordNameLookup = existingKeywords
            .Where(x => !string.IsNullOrWhiteSpace(x.DisplayName))
            .GroupBy(x => x.DisplayName.Trim().ToLower())
            .ToDictionary(x => x.Key, x => x.First());

        var topicsToAdd = new List<Topic>();

        var topicKeywordsToAdd = new List<TopicKeyword>();

        var syncedTopicIds = new HashSet<string>();

        var syncedTopicKeywordIds = new HashSet<string>();

        foreach (var openAlexTopic in allTopics)
        {
            var topicOpenAlexId = openAlexTopic.Id?.Split("/").Last();

            if (string.IsNullOrWhiteSpace(topicOpenAlexId))
                continue;

            syncedTopicIds.Add(topicOpenAlexId);

            Topic topic;

            if (topicsLookup.TryGetValue(topicOpenAlexId, out var existingTopic))
            {
                topic = existingTopic;

                topic.DisplayName = openAlexTopic.DisplayName ?? string.Empty;
                topic.WorksCount = openAlexTopic.WorksCount ?? 0;
                topic.SyncedAt = syncTime;

                var subFieldOpenAlexId = openAlexTopic.SubField?.Id?.Split("/").Last();

                if (!string.IsNullOrWhiteSpace(subFieldOpenAlexId))
                {
                    var subField = await _subFieldRepository.FirstOrDefaultAsync(
                        x => x.OpenAlexId == subFieldOpenAlexId,
                        cancellationToken
                    );

                    if (subField != null)
                        topic.SubFieldId = subField.Id;
                }
            }
            else
            {
                var subFieldOpenAlexId = openAlexTopic.SubField?.Id?.Split("/").Last();

                Guid subFieldId = Guid.Empty;

                if (!string.IsNullOrWhiteSpace(subFieldOpenAlexId))
                {
                    var subField = await _subFieldRepository.FirstOrDefaultAsync(
                        x => x.OpenAlexId == subFieldOpenAlexId,
                        cancellationToken
                    );

                    if (subField != null)
                        subFieldId = subField.Id;
                }

                topic = new Topic
                {
                    Id = Guid.NewGuid(),
                    OpenAlexId = topicOpenAlexId,
                    DisplayName = openAlexTopic.DisplayName ?? string.Empty,
                    WorksCount = openAlexTopic.WorksCount ?? 0,
                    SubFieldId = subFieldId,
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

                if (!keywordNameLookup.TryGetValue(keywordName, out var keyword))
                    continue;

                var relationKey = $"{topic.Id}_{keyword.Id}";

                syncedTopicKeywordIds.Add(relationKey);

                if (!topicKeywordLookup.ContainsKey(relationKey))
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

        if (topicKeywordsToDelete.Any())
            _topicKeywordRepository.DeleteRange(topicKeywordsToDelete);

        var topicsToDelete = existingTopics
            .Where(x => !syncedTopicIds.Contains(x.OpenAlexId))
            .ToList();

        if (topicsToDelete.Any())
        {
            var deletedTopicIds = topicsToDelete.Select(x => x.Id).ToHashSet();

            var remainingTopicKeywords = existingTopicKeywords
                .Where(x => deletedTopicIds.Contains(x.TopicId))
                .ToList();

            if (remainingTopicKeywords.Any())
                _topicKeywordRepository.DeleteRange(remainingTopicKeywords);

            _topicRepository.DeleteRange(topicsToDelete);
        }

        if (topicsToAdd.Any())
            await _topicRepository.AddRangeAsync(topicsToAdd, cancellationToken);

        if (topicKeywordsToAdd.Any())
            await _topicKeywordRepository.AddRangeAsync(topicKeywordsToAdd, cancellationToken);

        await _context.CompleteAsync(cancellationToken);
    }

    public async Task SyncKeywordsAsync(CancellationToken cancellationToken)
    {
        var syncTime = DateTime.UtcNow;

        var allKeywords = await _openAlexClientService.GetAllAsync<OpenAlexKeywordDto>(
            OpenAlexEntityKeys.Keywords,
            null,
            null,
            null,
            cancellationToken
        );

        var existingKeywords = await _keywordRepository.GetAllAsync(cancellationToken);

        var existingTopicKeywords = await _topicKeywordRepository.GetAllAsync(cancellationToken);

        var existingKeywordsLookup = existingKeywords.ToDictionary(x => x.OpenAlexId);

        var keywordsToAdd = new List<Keyword>();

        var syncedKeywordIds = new HashSet<string>();

        var keywordsToUpdate = new List<Keyword>();

        foreach (var openAlexKeyword in allKeywords)
        {
            var openAlexId = openAlexKeyword.Id?.Split("/").Last();

            if (string.IsNullOrWhiteSpace(openAlexId))
                continue;

            syncedKeywordIds.Add(openAlexId);

            if (existingKeywordsLookup.TryGetValue(openAlexId, out var keyword))
            {
                keyword.DisplayName = openAlexKeyword.DisplayName ?? string.Empty;
                keyword.WorksCount = openAlexKeyword.WorksCount ?? 0;
                keyword.SyncedAt = syncTime;

                keywordsToUpdate.Add(keyword);
            }
            else
            {
                keyword = new Keyword
                {
                    Id = Guid.NewGuid(),
                    OpenAlexId = openAlexId,
                    DisplayName = openAlexKeyword.DisplayName ?? string.Empty,
                    WorksCount = openAlexKeyword.WorksCount ?? 0,
                    SyncedAt = syncTime,
                };

                keywordsToAdd.Add(keyword);

                existingKeywordsLookup.Add(openAlexId, keyword);
            }
        }

        var keywordsToDelete = existingKeywords
            .Where(x => !syncedKeywordIds.Contains(x.OpenAlexId))
            .ToList();

        if (keywordsToDelete.Any())
        {
            var deletedKeywordIds = keywordsToDelete.Select(x => x.Id).ToHashSet();

            var topicKeywordsToDelete = existingTopicKeywords
                .Where(x => deletedKeywordIds.Contains(x.KeywordId))
                .ToList();

            if (topicKeywordsToDelete.Any())
                _topicKeywordRepository.DeleteRange(topicKeywordsToDelete);

            _keywordRepository.DeleteRange(keywordsToDelete);
        }

        if (keywordsToAdd.Any())
            await _keywordRepository.AddRangeAsync(keywordsToAdd, cancellationToken);

        await _context.CompleteAsync(cancellationToken);
    }
}
