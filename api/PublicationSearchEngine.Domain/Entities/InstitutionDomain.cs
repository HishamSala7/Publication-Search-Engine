namespace PublicationSearchEngine.Domain.Entities;

public class InstitutionDomain : EntityBase
{
    public string Domain { get; set; } = string.Empty;
    public Guid InstitutionId { get; set; }
    public virtual Institution? Institution { get; set; }
}
