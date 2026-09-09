using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Data.EntityConfiguration;

public class FieldConfiguration : EntityBaseConfiguration<Field>
{
    public override void Configure(EntityTypeBuilder<Field> builder)
    {
        base.Configure(builder);
        builder.ToTable("fields");

        builder.Property(f => f.OpenAlexId).HasColumnName("open_alex_id").IsRequired();

        builder.HasIndex(f => f.OpenAlexId).IsUnique();

        builder.Property(f => f.DisplayName).HasColumnName("display_name").IsRequired();

        builder.Property(f => f.WorksCount).HasColumnName("works_count").IsRequired();

        builder.Property(x => x.SyncedAt).HasColumnName("synced_at").IsRequired();
    }
}
