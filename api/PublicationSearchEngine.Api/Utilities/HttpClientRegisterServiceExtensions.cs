namespace PublicationSearchEngine.Api.Utilities;

public static class HttpClientRegisterServiceExtensions
{
    public static IHttpClientBuilder AddOpenAlexClient<TClient>(
        this IServiceCollection services,
        IConfiguration configuration
    )
        where TClient : class
    {
        return services
            .AddHttpClient<TClient>(client =>
            {
                var baseUrl = configuration["OpenAlex:BaseUrl"] ?? "https://api.openalex.org/";
                client.BaseAddress = new Uri(baseUrl);
                client.DefaultRequestHeaders.Add("User-Agent", "Publication Search");
            })
            .AddHttpMessageHandler<OpenAlexRequestHandler>();
    }

    public static IHttpClientBuilder AddRorClient<TClient>(
        this IServiceCollection services,
        IConfiguration configuration
    )
        where TClient : class
    {
        return services.AddHttpClient<TClient>(client =>
        {
            var baseUrl = configuration["Ror:BaseUrl"] ?? "https://api.ror.org/v2/";
            client.BaseAddress = new Uri(baseUrl);
        });
    }

    public static IHttpClientBuilder AddHipoClient<TClient>(
        this IServiceCollection services,
        IConfiguration configuration
    )
        where TClient : class
    {
        return services.AddHttpClient<TClient>(client =>
        {
            var datasetUrl =
                configuration["Hipo:BaseUrl"]
                ?? "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json";
            client.BaseAddress = new Uri(datasetUrl);
        });
    }
}
