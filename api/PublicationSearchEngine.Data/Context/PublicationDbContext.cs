using Microsoft.EntityFrameworkCore;
using PublicationSearchEngine.Domain.Entities;

namespace PublicationSearchEngine.Data.Context;

public class PublicationDbContext : DbContext
{
    public DbSet<Institution> Institutions { get; set; }
    public DbSet<InstitutionDomain> InstitutionDomains { get; set; }
    public DbSet<Field> Fields { get; set; }
    public DbSet<SubField> SubFields { get; set; }
    public DbSet<Topic> Topics { get; set; }
    public DbSet<Keyword> Keywords { get; set; }

    public PublicationDbContext(DbContextOptions<PublicationDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PublicationDbContext).Assembly);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
    }
}
