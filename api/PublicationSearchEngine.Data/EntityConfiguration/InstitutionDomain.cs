using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Data.EntityConfiguration;

public class InstitutionDomainConfiguration : EntityBaseConfiguration<InstitutionDomain>
{
    public override void Configure(EntityTypeBuilder<InstitutionDomain> builder)
    {
        base.Configure(builder);
        builder.ToTable("institution_domains");

        builder.Property(x => x.Domain).HasColumnName("domain").IsRequired();

        builder.HasIndex(x => x.Domain).IsUnique();

        builder.Property(x => x.InstitutionId).HasColumnName("institution_id").IsRequired();

        builder
            .HasOne(x => x.Institution)
            .WithMany(i => i.Domains)
            .HasForeignKey(x => x.InstitutionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
