using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Data.EntityConfiguration;

public class OpenAlexInstitutionConfiguration : EntityBaseConfiguration<OpenAlexInstitution>
{
    public override void Configure(EntityTypeBuilder<OpenAlexInstitution> builder)
    {
        base.Configure(builder);
        builder.ToTable("open_alex_institutions");

        builder.Property(f => f.OpenAlexId).HasColumnName("open_alex_id").IsRequired();

        builder.HasIndex(x => x.OpenAlexId).IsUnique();

        builder.Property(f => f.DisplayName).HasColumnName("display_name").IsRequired();

        builder.Property(f => f.Ror).HasColumnName("ror");

        builder.Property(f => f.WorksCount).HasColumnName("works_count").IsRequired();

        builder.Property(x => x.SyncedAt).HasColumnName("synced_at").IsRequired();

        builder.Property(f => f.CountryId).HasColumnName("country_id");

        builder
            .HasOne(x => x.Country)
            .WithMany(x => x.OpenAlexInstitutions)
            .HasForeignKey(x => x.CountryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
