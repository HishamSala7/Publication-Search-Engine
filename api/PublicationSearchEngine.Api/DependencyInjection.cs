using Microsoft.EntityFrameworkCore;
using PublicationSearchEngine.Api.Utilities;
using PublicationSearchEngine.Application.DTOs;
using PublicationSearchEngine.Application.Interfaces;
using PublicationSearchEngine.Application.Services;
using PublicationSearchEngine.Application.Services.HttpClientServices;
using PublicationSearchEngine.Data.Cache;
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

        // options configuration
        services.Configure<HipoRequestConfiguration>(builder.Configuration.GetSection("Hipo"));

        services.Configure<RorRequestConfiguration>(builder.Configuration.GetSection("Ror"));

        services.AddTransient<OpenAlexRequestHandler>();

        // Memory cache
        services.AddMemoryCache();
        services.AddScoped<ICacheService, MemoryCacheService>();

        // Http clients
        builder.Services.AddOpenAlexClient<OpenAlexClientService>(builder.Configuration);
        builder.Services.AddRorClient<RorService>(builder.Configuration);
        builder.Services.AddHipoClient<HipoDomainSyncService>(builder.Configuration);

        // services
        services.AddScoped<InstitutionResolutionService>();
        services.AddScoped<SearchEngineDropDownsService>();
        services.AddScoped<OpenAlexSyncService>();
        services.AddScoped<OpenAlexService>();

        // repositories
        services.AddScoped<IApplicationDbContext, ApplicationDbContext>();
        services.AddScoped<IInstitutionRepository, InstitutionRepository>();
        services.AddScoped<IInstitutionDomainRepository, InstitutionDomainRepository>();
        services.AddScoped<ICountryRepository, CountryRepository>();
        services.AddScoped<IFieldRepository, FieldRepository>();
        services.AddScoped<IKeywordRepository, KeywordRepository>();
        services.AddScoped<ISubFieldRepository, SubFieldRepository>();
        services.AddScoped<ITopicRepository, TopicRepository>();
        services.AddScoped<ITopicKeywordRepository, TopicKeywordRepository>();

        // interfaces & contracts
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
