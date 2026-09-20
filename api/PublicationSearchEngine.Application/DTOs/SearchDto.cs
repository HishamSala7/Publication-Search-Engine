namespace PublicationSearchEngine.Application.DTOs;

public class SearchDto
{
    public int Take { get; set; } = 10;
    public int Skip { get; set; } = 0;
    public string? Filter { get; set; }
    public bool IsDescending { get; set; }
    public string? OrderBy { get; set; }
}
