using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.Shared.Enums;

namespace PublicationSearchEngine.Data.EntityConfiguration;

public class InstitutionConfiguration : EntityBaseConfiguration<Institution>
{
    public override void Configure(EntityTypeBuilder<Institution> builder)
    {
        base.Configure(builder);
        builder.ToTable("institutions");

        builder.Property(x => x.Name).HasColumnName("name").IsRequired();

        builder.Property(x => x.Country).HasColumnName("country");

        builder.Property(x => x.AlphaTwoCode).HasColumnName("alpha_two_code");

        builder.Property(x => x.RorId).HasColumnName("ror_id");

        builder
            .Property(x => x.ResolutionMethod)
            .HasColumnName("resolution_method")
            .HasConversion(
                v => v.ToString(),
                v => (InstitutionResolutionMethod)Enum.Parse(typeof(InstitutionResolutionMethod), v)
            );

        builder.Property(x => x.RorLookupAttemptedAt).HasColumnName("ror_lookup_attempted_at");

        builder.Property(x => x.SyncedAt).HasColumnName("synced_at").IsRequired();

        builder.HasIndex(x => x.RorId).IsUnique();
    }
}
