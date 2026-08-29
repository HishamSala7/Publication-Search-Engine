using PublicationSearchEngine.Domain.Shared.Enums;

namespace PublicationSearchEngine.Domain.Entities;

public class Institution : EntityBase
{
    public string Name { get; set; } = string.Empty;
    public string? Country { get; set; }
    public string? AlphaTwoCode { get; set; }
    public string? RorId { get; set; }
    public InstitutionResolutionMethod? ResolutionMethod { get; set; } // null until resolved
    public DateTime? RorLookupAttemptedAt { get; set; }
    public DateTime SyncedAt { get; set; }

    public virtual ICollection<InstitutionDomain> Domains { get; set; } =
        new List<InstitutionDomain>();
}
