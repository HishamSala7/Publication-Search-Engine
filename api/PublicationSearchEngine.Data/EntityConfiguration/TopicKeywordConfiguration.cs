using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Data.EntityConfiguration;

public class TopicKeywordConfiguration : EntityBaseConfiguration<TopicKeyword>
{
    public override void Configure(EntityTypeBuilder<TopicKeyword> builder)
    {
        base.Configure(builder);
        builder.ToTable("topic_keywords");

        builder.Property(f => f.TopicId).HasColumnName("topic_id");

        builder.Property(f => f.KeywordId).HasColumnName("keyword_id");

        builder.HasIndex(x => new { x.TopicId, x.KeywordId }).IsUnique();

        builder
            .HasOne(x => x.Topic)
            .WithMany(i => i.TopicKeywords)
            .HasForeignKey(x => x.TopicId)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(x => x.Keyword)
            .WithMany(i => i.TopicKeywords)
            .HasForeignKey(x => x.KeywordId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
