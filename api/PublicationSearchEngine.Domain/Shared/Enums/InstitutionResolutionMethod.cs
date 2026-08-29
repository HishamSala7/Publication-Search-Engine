namespace PublicationSearchEngine.Domain.Shared.Enums;

public enum InstitutionResolutionMethod
{
    Domain = 1, // exact match on the ROR `domains` field — highest confidence
    NameExact = 2, // quoted phrase match via ROR's `query` param — high confidence
    NameFuzzy = 3, // unquoted any-word match via ROR's `query` param — lowest confidence
}
