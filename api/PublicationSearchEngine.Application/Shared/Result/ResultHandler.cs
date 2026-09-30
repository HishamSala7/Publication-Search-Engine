namespace PublicationSearchEngine.Application.Shared.Result;

public class ResultHandler
{
    public static Result Success(string message)
    {
        return new Result()
        {
            StatusCode = (int)System.Net.HttpStatusCode.OK,
            Succeeded = true,
            Message = message,
        };
    }

    public static Result<T> Success<T>(T entity)
    {
        return new Result<T>()
        {
            Data = entity,
            StatusCode = (int)System.Net.HttpStatusCode.OK,
            Succeeded = true,
        };
    }

    public static Result<T> Success<T>(T entity, string message)
    {
        return new Result<T>()
        {
            Data = entity,
            StatusCode = (int)System.Net.HttpStatusCode.OK,
            Succeeded = true,
            Message = message,
        };
    }

    public static Result<T> NoContent<T>(string message)
    {
        return new Result<T>()
        {
            StatusCode = (int)System.Net.HttpStatusCode.NoContent,
            Succeeded = true,
            Message = message,
        };
    }

    public static Result<T> BadRequest<T>(string message)
    {
        return new Result<T>()
        {
            StatusCode = (int)System.Net.HttpStatusCode.BadRequest,
            Succeeded = false,
            Message = message,
        };
    }

    public static Result<T> Failed<T>(string message)
    {
        return new Result<T>()
        {
            StatusCode = (int)System.Net.HttpStatusCode.InternalServerError,
            Succeeded = false,
            Message = message,
        };
    }

    public static Result<T> NotFound<T>(string message)
    {
        return new Result<T>()
        {
            StatusCode = (int)System.Net.HttpStatusCode.NotFound,
            Succeeded = false,
            Message = message,
        };
    }
}
