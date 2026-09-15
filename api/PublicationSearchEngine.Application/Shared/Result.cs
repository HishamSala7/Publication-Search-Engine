namespace PublicationSearchEngine.Application.Shared;

public class Result<T>
{
    public int StatusCode { get; set; }
    public bool Succeeded { get; set; } = false;
    public string? Message { get; set; } = string.Empty;
    //public List<ResultError> Errors { get; set; } = [];
    public T? Data { get; set; }
}

//public class ResultError
//{
//    public string Code { get; set; } = string.Empty;
//    public string Message { get; set; } = string.Empty;
//}
