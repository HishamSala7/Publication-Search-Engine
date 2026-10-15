using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Application.Services.HttpClientServices;
using PublicationSearchEngine.Application.Shared.Keys;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.IRepositories;
using PublicationSearchEngine.Domain.Shared.Enums;

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
    private readonly IWorkTypeRepository _workTypeRepository;
    private readonly IOpenAlexInstitutionRepository _openAlexInstitutionRepository;

    public OpenAlexSyncService(
        OpenAlexClientService openAlexClientService,
        IApplicationDbContext context,
        ICountryRepository countryRepository,
        IFieldRepository fieldRepository,
        IKeywordRepository keywordRepository,
        ISubFieldRepository subFieldRepository,
        ITopicRepository topicRepository,
        ITopicKeywordRepository topicKeywordRepository,
        IWorkTypeRepository workTypeRepository,
        IOpenAlexInstitutionRepository openAlexInstitutionRepository
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
        _workTypeRepository = workTypeRepository;
        _openAlexInstitutionRepository = openAlexInstitutionRepository;
    }

    public virtual async Task SyncCountriesAsync(CancellationToken cancellationToken)
    {
        var syncTime = DateTime.UtcNow;

        var allCountries = await _openAlexClientService.GetAllAsync<OpenAlexCountryDto>(
            OpenAlexEntities.Countries,
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
            OpenAlexEntities.Fields,
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
            OpenAlexEntities.SubFields,
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
            OpenAlexEntities.Topics,
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
            OpenAlexEntities.Keywords,
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

    public async Task SyncWorkTypesAsync(CancellationToken cancellationToken)
    {
        var syncTime = DateTime.UtcNow;

        var allWorkTypes = await _openAlexClientService.GetAllAsync<OpenAlexWorkTypeDto>(
            OpenAlexEntities.WorkTypes,
            null,
            null,
            null,
            cancellationToken
        );

        var existingWorkTypes = await _workTypeRepository.GetAllAsync(cancellationToken);

        var existingLookup = existingWorkTypes.ToDictionary(
            x => x.OpenAlexId,
            StringComparer.OrdinalIgnoreCase
        );

        var openAlexIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        var toAdd = new List<WorkType>();
        var toUpdate = new List<WorkType>();

        foreach (var openAlexWorkType in allWorkTypes)
        {
            var openAlexId = openAlexWorkType.Id?.Split("/").LastOrDefault();

            if (string.IsNullOrWhiteSpace(openAlexId))
                continue;

            openAlexIds.Add(openAlexId);

            var publicationType = MapOpenAlexTypeToPublicationType(openAlexId);

            if (existingLookup.TryGetValue(openAlexId, out var existing))
            {
                existing.OpenAlexDisplayName = openAlexWorkType.DisplayName ?? openAlexId;
                existing.WorksCount = openAlexWorkType.WorksCount ?? 0;
                existing.Type = publicationType;
                existing.SyncedAt = syncTime;

                toUpdate.Add(existing);

                continue;
            }

            toAdd.Add(
                new WorkType
                {
                    Id = Guid.NewGuid(),
                    OpenAlexId = openAlexId,
                    OpenAlexDisplayName = openAlexWorkType.DisplayName ?? openAlexId,
                    WorksCount = openAlexWorkType.WorksCount ?? 0,
                    Type = publicationType,
                    SyncedAt = syncTime,
                }
            );
        }

        var toDelete = existingWorkTypes.Where(x => !openAlexIds.Contains(x.OpenAlexId)).ToList();

        if (toAdd.Any())
            await _workTypeRepository.AddRangeAsync(toAdd, cancellationToken);

        if (toUpdate.Any())
            _workTypeRepository.UpdateRange(toUpdate);

        if (toDelete.Any())
            _workTypeRepository.DeleteRange(toDelete);

        await _context.CompleteAsync(cancellationToken);
    }

    public async Task SyncOpenAlexInstitutionsAsync(CancellationToken cancellationToken)
    {
        var syncTime = DateTime.UtcNow;

        var allInstitutions = await _openAlexClientService.GetAllAsync<OpenAlexInstitutionDto>(
            OpenAlexEntities.Institutions,
            null,
            null,
            null,
            cancellationToken
        );

        var uniqueInstitutions = allInstitutions
            .Select(x => new
            {
                Institution = x,
                OpenAlexId = x.Id?.Split("/").LastOrDefault()?.Trim(),
                Ror = NormalizeRor(x.Ror),
            })
            .Where(x => !string.IsNullOrWhiteSpace(x.OpenAlexId))
            .GroupBy(
                x =>
                    !string.IsNullOrWhiteSpace(x.Ror) ? $"ROR:{x.Ror}" : $"OPENALEX:{x.OpenAlexId}",
                StringComparer.OrdinalIgnoreCase
            )
            .Select(x => x.First())
            .ToList();

        var existingInstitutions = await _openAlexInstitutionRepository.GetAllAsync(
            cancellationToken
        );

        var existingByOpenAlexId = existingInstitutions
            .Where(x => !string.IsNullOrWhiteSpace(x.OpenAlexId))
            .GroupBy(x => x.OpenAlexId, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(x => x.Key, x => x.First(), StringComparer.OrdinalIgnoreCase);

        var existingByRor = existingInstitutions
            .Where(x => !string.IsNullOrWhiteSpace(x.Ror))
            .Select(x => new { Institution = x, Ror = NormalizeRor(x.Ror) })
            .Where(x => !string.IsNullOrWhiteSpace(x.Ror))
            .GroupBy(x => x.Ror!, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(x => x.Key, x => x.First().Institution, StringComparer.OrdinalIgnoreCase);

        var countries = await _countryRepository.GetAllAsync(cancellationToken);

        var countryLookup = countries
            .Where(x => !string.IsNullOrWhiteSpace(x.CountryCodeAlphaTwo))
            .GroupBy(x => x.CountryCodeAlphaTwo!.Trim(), StringComparer.OrdinalIgnoreCase)
            .ToDictionary(x => x.Key, x => x.First(), StringComparer.OrdinalIgnoreCase);

        var toAdd = new List<OpenAlexInstitution>();
        var toUpdate = new List<OpenAlexInstitution>();

        var syncedInstitutionIds = new HashSet<Guid>();

        foreach (var item in uniqueInstitutions)
        {
            var institution = item.Institution;
            var openAlexId = item.OpenAlexId!;
            var normalizedRor = item.Ror;

            Guid? countryId = null;

            var countryCode = institution.CountryCode?.Trim();

            if (
                !string.IsNullOrWhiteSpace(countryCode)
                && countryLookup.TryGetValue(countryCode, out var country)
            )
                countryId = country.Id;

            OpenAlexInstitution? existing = null;

            if (
                !string.IsNullOrWhiteSpace(normalizedRor)
                && existingByRor.TryGetValue(normalizedRor, out var existingByRorMatch)
            )
            {
                existing = existingByRorMatch;
            }
            else if (
                existingByOpenAlexId.TryGetValue(openAlexId, out var existingByOpenAlexIdMatch)
            )
            {
                existing = existingByOpenAlexIdMatch;
            }

            if (existing != null)
            {
                existing.OpenAlexId = openAlexId;
                existing.DisplayName = institution.DisplayName ?? string.Empty;
                existing.Ror = institution.Ror;
                existing.CountryId = countryId;
                existing.WorksCount = institution.WorksCount ?? 0;
                existing.SyncedAt = syncTime;

                toUpdate.Add(existing);

                syncedInstitutionIds.Add(existing.Id);

                existingByOpenAlexId[openAlexId] = existing;

                if (!string.IsNullOrWhiteSpace(normalizedRor))
                    existingByRor[normalizedRor] = existing;

                continue;
            }

            var newInstitution = new OpenAlexInstitution
            {
                Id = Guid.NewGuid(),
                OpenAlexId = openAlexId,
                DisplayName = institution.DisplayName ?? string.Empty,
                Ror = institution.Ror,
                CountryId = countryId,
                WorksCount = institution.WorksCount ?? 0,
                SyncedAt = syncTime,
            };

            toAdd.Add(newInstitution);

            syncedInstitutionIds.Add(newInstitution.Id);

            existingByOpenAlexId[openAlexId] = newInstitution;

            if (!string.IsNullOrWhiteSpace(normalizedRor))
                existingByRor[normalizedRor] = newInstitution;
        }

        var toDelete = existingInstitutions
            .Where(x => !syncedInstitutionIds.Contains(x.Id))
            .ToList();

        if (toAdd.Any())
            await _openAlexInstitutionRepository.AddRangeAsync(toAdd, cancellationToken);

        if (toUpdate.Any())
            _openAlexInstitutionRepository.UpdateRange(toUpdate);

        if (toDelete.Any())
            _openAlexInstitutionRepository.DeleteRange(toDelete);

        await _context.CompleteAsync(cancellationToken);
    }

    private static string? NormalizeRor(string? ror)
    {
        if (string.IsNullOrWhiteSpace(ror))
            return null;

        return ror.Trim().TrimEnd('/').ToLowerInvariant();
    }

    private static PublicationType MapOpenAlexTypeToPublicationType(string openAlexType)
    {
        return openAlexType.ToLowerInvariant() switch
        {
            "article" => PublicationType.Article,

            "book" => PublicationType.Book,

            "book-chapter" => PublicationType.BookChapter,

            "conference-paper" or "conference-abstract" => PublicationType.Conference,

            "preprint" => PublicationType.Preprint,

            _ => PublicationType.Other,
        };
    }
}
