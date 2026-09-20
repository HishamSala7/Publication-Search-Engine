namespace PublicationSearchEngine.Application.Shared.Result;

public class Result
{
    public int StatusCode { get; set; }
    public bool Succeeded { get; set; } = false;
    public string? Message { get; set; } = string.Empty;
    //public List<ResultError> Errors { get; set; } = [];
}

public class Result<T> : Result
{
    public T? Data { get; set; }
}

//public class ResultError
//{
//    public string Code { get; set; } = string.Empty;
//    public string Message { get; set; } = string.Empty;
//}
