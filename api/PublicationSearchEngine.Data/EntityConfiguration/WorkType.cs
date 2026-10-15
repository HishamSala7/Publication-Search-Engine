using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PublicationSearchEngine.Domain.Entities;
using PublicationSearchEngine.Domain.Shared.Enums;

namespace PublicationSearchEngine.Data.EntityConfiguration;

public class WorkTypeConfiguration : EntityBaseConfiguration<WorkType>
{
    public override void Configure(EntityTypeBuilder<WorkType> builder)
    {
        base.Configure(builder);
        builder.ToTable("work_types");

        builder.Property(f => f.OpenAlexId).HasColumnName("open_alex_id").IsRequired();

        builder
            .Property(f => f.OpenAlexDisplayName)
            .HasColumnName("open_alex_display_name")
            .IsRequired();

        builder
            .Property(x => x.Type)
            .HasColumnName("type")
            .HasConversion(
                v => v.ToString(),
                v => (PublicationType)Enum.Parse(typeof(PublicationType), v)
            );

        builder.Property(f => f.WorksCount).HasColumnName("works_count").IsRequired();

        builder.Property(x => x.SyncedAt).HasColumnName("synced_at").IsRequired();
    }
}
