using Microsoft.EntityFrameworkCore;
using PublicationSearchEngine.Api.Utilities;
using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Application.Services;
using PublicationSearchEngine.Data.Context;
using PublicationSearchEngine.Data.Repositories;
using PublicationSearchEngine.Domain.IRepositories;

namespace PublicationSearchEngine.Api;

public static class DependencyInjection
{
    public static void AddApiDependencyInjection(this WebApplicationBuilder builder)
    {
        IServiceCollection services = builder.Services;

        services.AddControllers();

        services.AddOpenApi();

        services.AddDbContext<PublicationDbContext>(options =>
            options
                .UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
                .UseLazyLoadingProxies()
        );

        services.Configure<OpenAlexRequestConfiguration>(
            builder.Configuration.GetSection("OpenAlex")
        );

        services.Configure<HipoRequestConfiguration>(builder.Configuration.GetSection("Hipo"));

        services.Configure<RorRequestConfiguration>(builder.Configuration.GetSection("Ror"));

        services.AddTransient<OpenAlexRequestHandler>();

        builder
            .Services.AddHttpClient<OpenAlexService>(client =>
            {
                var baseUrl =
                    builder.Configuration["OpenAlex:BaseUrl"] ?? "https://api.openalex.org/";
                client.BaseAddress = new Uri(baseUrl);
                client.DefaultRequestHeaders.Add("User-Agent", "Publication Search");
            })
            .AddHttpMessageHandler<OpenAlexRequestHandler>();

        services.AddHttpClient<RorService>(client =>
        {
            var baseUrl = builder.Configuration["Ror:BaseUrl"] ?? "https://api.ror.org/v2/";
            client.BaseAddress = new Uri(baseUrl);
        });

        services.AddHttpClient<HipoDomainSyncService>(client =>
        {
            var datasetUrl =
                builder.Configuration["Hipo:BaseUrl"]
                ?? "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json";
            client.BaseAddress = new Uri(datasetUrl);
        });

        // services
        services.AddScoped<InstitutionResolutionService>();

        // repositories
        services.AddScoped<IApplicationDbContext, ApplicationDbContext>();
        services.AddScoped<IInstitutionRepository, InstitutionRepository>();
        services.AddScoped<IInstitutionDomainRepository, InstitutionDomainRepository>();
    }

    public static void AddApiMiddleWares(this WebApplication app)
    {
        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();

            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/openapi/v1.json", "v1");
            });
        }

        app.UseHttpsRedirection();

        app.UseAuthorization();

        app.MapControllers();
    }
}
