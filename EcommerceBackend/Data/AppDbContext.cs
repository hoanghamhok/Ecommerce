using Microsoft.EntityFrameworkCore;
using Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Cart> Carts { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderDetail> OrderDetails { get; set; }
    public DbSet<Wishlist> Wishlists { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<ProductRating> ProductRatings { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Review Configuration
            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(r => r.Id);

                entity.Property(r => r.Rating)
                      .IsRequired()
                      .HasAnnotation("Range", new[] { 1, 5 });

                entity.Property(r => r.Comment)
                      .IsRequired()
                      .HasMaxLength(1000);

                entity.Property(r => r.CreatedAt)
                      .HasDefaultValueSql("GETUTCDATE()");

                // Foreign Key Relationships
                entity.HasOne(r => r.Product)
                      .WithMany()
                      .HasForeignKey(r => r.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.User)
                      .WithMany()
                      .HasForeignKey(r => r.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Unique constraint - một user chỉ review một product một lần
                entity.HasIndex(r => new { r.UserId, r.ProductId })
                      .IsUnique()
                      .HasDatabaseName("IX_Review_User_Product_Unique");

                // Index for performance
                entity.HasIndex(r => r.ProductId)
                      .HasDatabaseName("IX_Review_ProductId");

                entity.HasIndex(r => r.CreatedAt)
                      .HasDatabaseName("IX_Review_CreatedAt");
            });

            // ProductRating Configuration
            modelBuilder.Entity<ProductRating>(entity =>
            {
                entity.HasKey(pr => pr.ProductId);

                entity.Property(pr => pr.AverageRating)
                      .HasColumnType("decimal(3,2)") // 0.00 to 5.00
                      .HasDefaultValue(0);

                entity.Property(pr => pr.TotalReviews)
                      .HasDefaultValue(0);

                entity.Property(pr => pr.Rating1Star)
                      .HasDefaultValue(0);

                entity.Property(pr => pr.Rating2Star)
                      .HasDefaultValue(0);

                entity.Property(pr => pr.Rating3Star)
                      .HasDefaultValue(0);

                entity.Property(pr => pr.Rating4Star)
                      .HasDefaultValue(0);

                entity.Property(pr => pr.Rating5Star)
                      .HasDefaultValue(0);

                entity.Property(pr => pr.LastUpdated)
                      .HasDefaultValueSql("GETUTCDATE()");

                // Foreign Key Relationship
                entity.HasOne(pr => pr.Product)
                      .WithOne()
                      .HasForeignKey<ProductRating>(pr => pr.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Cập nhật Product entity để có navigation property (optional)
            modelBuilder.Entity<Product>(entity =>
            {
                // Existing configuration...
                
                // Add these if you want navigation properties
                entity.HasMany<Review>()
                      .WithOne(r => r.Product)
                      .HasForeignKey(r => r.ProductId);

                entity.HasOne<ProductRating>()
                      .WithOne(pr => pr.Product)
                      .HasForeignKey<ProductRating>(pr => pr.ProductId);
            });
        }
}