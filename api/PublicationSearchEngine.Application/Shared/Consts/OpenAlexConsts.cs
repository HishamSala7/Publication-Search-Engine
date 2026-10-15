namespace PublicationSearchEngine.Application.Shared.Consts;

public class OpenAlexConsts
{
    public const int PerPageMaxLimit = 100;
    public const int AuthorCandidatesPerPageCount = 10;

    public const string DateFormat = "yyyy-MM-dd";

    public static readonly TimeSpan WorksExpiration = TimeSpan.FromHours(1);
    public static readonly TimeSpan AuthorOrcidExpiration = TimeSpan.FromDays(1);
    public static readonly TimeSpan DoiWorkExpiration = TimeSpan.FromDays(7);
    public static readonly TimeSpan InstitutionExpiration = TimeSpan.FromDays(7);
    public static readonly TimeSpan AuthorPositionExpiration = TimeSpan.FromDays(1);
    public static readonly TimeSpan AuthorDetailExpiration = TimeSpan.FromHours(24);
}
