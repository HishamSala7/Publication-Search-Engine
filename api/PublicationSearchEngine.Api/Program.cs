namespace PublicationSearchEngine.Api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.AddApiDependencyInjection();

        var app = builder.Build();

        app.AddApiMiddleWares();

        app.Run();
    }
}
