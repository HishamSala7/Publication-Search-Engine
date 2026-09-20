namespace PublicationSearchEngine.Application.DTOs;

public class SearchEngineDropDownCountrySearchDto : SearchDto { }

public class SearchEngineDropDownCountryDto
{
    public Guid Id { get; set; }
    public string OpenAlexId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Continent { get; set; } = string.Empty;
}

public class SearchEngineDropDownFieldSearchDto : SearchDto { }

public class SearchEngineDropDownFieldDto
{
    public Guid Id { get; set; }
    public string OpenAlexId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}

public class SearchEngineDropDownSubFieldSearchDto : SearchDto
{
    public List<Guid> FieldIds { get; set; } = [];
}

public class SearchEngineDropDownSubFieldDto
{
    public Guid Id { get; set; }
    public string OpenAlexId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}

public class SearchEngineDropDownTopicSearchDto : SearchDto
{
    public List<Guid> SubFieldIds { get; set; } = [];
    public List<Guid> FieldIds { get; set; } = [];
}

public class SearchEngineDropDownTopicDto
{
    public Guid Id { get; set; }
    public string OpenAlexId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}

public class SearchEngineDropDownKeywordSearchDto : SearchDto
{
    public List<Guid> SubFieldIds { get; set; } = [];
    public List<Guid> FieldIds { get; set; } = [];
    public List<Guid> TopicIds { get; set; } = [];
}

public class SearchEngineDropDownKeywordDto
{
    public Guid Id { get; set; }
    public string OpenAlexId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}
