using PublicationSearchEngine.Domain.Shared.Enums;

namespace PublicationSearchEngine.Domain.Entities;

public class WorkType : EntityBase
{
    public string OpenAlexId { get; set; } = string.Empty;
    public string OpenAlexDisplayName { get; set; } = string.Empty;
    public PublicationType Type { get; set; }
    public long WorksCount { get; set; }
    public DateTime SyncedAt { get; set; }
}
