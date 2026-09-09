using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Data.EntityConfiguration;

public class SubFieldConfiguration : EntityBaseConfiguration<SubField>
{
    public override void Configure(EntityTypeBuilder<SubField> builder)
    {
        base.Configure(builder);
        builder.ToTable("sub_fields");

        builder.Property(f => f.OpenAlexId).HasColumnName("open_alex_id").IsRequired();

        builder.HasIndex(f => f.OpenAlexId).IsUnique();

        builder.Property(f => f.DisplayName).HasColumnName("display_name").IsRequired();

        builder.Property(f => f.WorksCount).HasColumnName("works_count").IsRequired();

        builder.Property(x => x.SyncedAt).HasColumnName("synced_at").IsRequired();

        builder.Property(f => f.FieldId).HasColumnName("field_id").IsRequired();

        builder
            .HasOne(x => x.Field)
            .WithMany(i => i.SubFields)
            .HasForeignKey(x => x.FieldId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
