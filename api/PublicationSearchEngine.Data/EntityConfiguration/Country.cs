using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Data.EntityConfiguration;

public class CountryConfiguration : EntityBaseConfiguration<Country>
{
    public override void Configure(EntityTypeBuilder<Country> builder)
    {
        base.Configure(builder);
        builder.ToTable("countries");

        builder.Property(f => f.OpenAlexId).HasColumnName("open_alex_id").IsRequired();

        builder.HasIndex(f => f.OpenAlexId).IsUnique();

        builder.Property(f => f.DisplayName).HasColumnName("display_name").IsRequired();

        builder.Property(f => f.WorksCount).HasColumnName("works_count").IsRequired();

        builder.Property(x => x.SyncedAt).HasColumnName("synced_at").IsRequired();

        builder.Property(x => x.CountryCodeAlphaTwo).HasColumnName("country_code_alpha_two");

        builder.Property(x => x.CountryCodeAlphaThree).HasColumnName("country_code_alpha_three");

        builder.Property(x => x.Continent).HasColumnName("continent");
    }
}
