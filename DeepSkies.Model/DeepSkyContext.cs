using Microsoft.EntityFrameworkCore;

namespace DeepSkies.Model
{
    public class DeepSkyContext : DbContext
    {
        public DeepSkyContext(DbContextOptions<DeepSkyContext> options) : base(options)
        {
        }

        public DbSet<Exhibit> Exhibits { get; set; }
        public DbSet<Telescope> Telescopes { get; set; }
        public DbSet<TargetType> TargetTypes { get; set; }
        public DbSet<Tag> Tags { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Exhibit>().Property(e => e.RA)
                .HasConversion(
                ra => ra == null 
                ? string.Empty 
                : ra.ToString(), 
                str => string.IsNullOrWhiteSpace(str)
                ? null 
                : new RightAscension(str));
         
            modelBuilder.Entity<Exhibit>().Property(e => e.Dec)
                .HasConversion(
                dec => dec == null
                ? string.Empty
                : dec.ToString(), 
                str => string.IsNullOrWhiteSpace(str)
                ? null
                : new Declination(str));

            modelBuilder.Entity<Exhibit>().HasMany(e => e.Tags).WithMany();
            
            base.OnModelCreating(modelBuilder);
        }
    }
}
