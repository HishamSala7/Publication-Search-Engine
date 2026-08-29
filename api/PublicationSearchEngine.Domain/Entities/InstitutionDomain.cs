namespace PublicationSearchEngine.Domain.Entities;

public class InstitutionDomain : EntityBase
{
    public string Domain { get; set; } = string.Empty;
    public Guid InstitutionId { get; set; }
    public Institution Institution { get; set; } = default!;
}
