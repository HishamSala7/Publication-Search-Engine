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

        // Http clients
        builder.Services.AddOpenAlexClient<OpenAlexService>(builder.Configuration);
        builder.Services.AddOpenAlexClient<OpenAlexSyncService>(builder.Configuration);
        builder.Services.AddRorClient<RorService>(builder.Configuration);
        builder.Services.AddHipoClient<HipoDomainSyncService>(builder.Configuration);

        // services
        services.AddScoped<InstitutionResolutionService>();

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
