using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Data.EntityConfiguration;

public class EntityBaseConfiguration<T> : IEntityTypeConfiguration<T>
    where T : EntityBase
{
    public virtual void Configure(EntityTypeBuilder<T> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
    }
}
