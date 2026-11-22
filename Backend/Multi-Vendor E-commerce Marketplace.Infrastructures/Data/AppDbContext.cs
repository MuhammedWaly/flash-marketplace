using MediatR;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Customer;
using Multi_Vendor_Marketplace.Domain.Dishes;
using Multi_Vendor_Marketplace.Domain.Merchant;
using Multi_Vendor_Marketplace.Domain.Order;
using Multi_Vendor_Marketplace.Domain.OrderItem;
using Multi_Vendor_Marketplace.Domain.Payments;
using Multi_Vendor_Marketplace.Domain.Resturants;
using Multi_Vendor_Marketplace.Domain.Review;
using Multi_Vendor_Marketplace.Domain.Users;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Infrastructures.Data
{
    internal class AppDbContext(
        DbContextOptions<AppDbContext> options,
        IPublisher? publisher = null) : IdentityDbContext<User>(options), IAppDbContext
    {
        public DbSet<Resturant> Resturants { get; set; } = null!;
        public DbSet<Dish> Dishes { get; set; } = null!;
        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
        public DbSet<Customer> Customers { get; set; } = null!;
        public DbSet<Merchant> Merchants { get; set; } = null!;
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<OrderItem> OrderItems { get; set; } = null!;
        public DbSet<Review> Reviews { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;
        public DbSet<ProcessedWebhookEvent> ProcessedWebhookEvents { get; set; } = null!;

        public Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
            => Database.BeginTransactionAsync(cancellationToken);

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Token).IsUnique();
                entity.Property(e => e.Token).IsRequired().HasMaxLength(256);
            });

            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId).IsUnique();
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.DeliveryAddressTitle).HasMaxLength(250);
                entity.Ignore(e => e.Addresses);
                entity.Ignore(e => e.Orders);
                entity.Ignore(e => e.Reviews);
                entity.Ignore(e => e.Cart);
            });

            modelBuilder.Entity<Merchant>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId).IsUnique();
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.Balance).HasPrecision(18, 2);
                entity.Property(e => e.CommissionRate).HasPrecision(18, 2);
                entity.Property(e => e.StripeAccountId).HasMaxLength(100);
                entity.Ignore(e => e.Products);
                entity.Ignore(e => e.LedgerEntries);
                entity.Ignore(e => e.Payouts);
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.OrderNumber).IsUnique();
                entity.Property(e => e.OrderNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.SubTotal).HasPrecision(18, 2);
                entity.Property(e => e.ShippingFee).HasPrecision(18, 2);
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
                entity.Property(e => e.ShippingAddress).HasMaxLength(500);
                entity.Property(e => e.PaymentMethod).HasMaxLength(50);

                entity.HasOne(e => e.Customer)
                    .WithMany()
                    .HasForeignKey(e => e.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Resturant)
                    .WithMany()
                    .HasForeignKey(e => e.ResturantId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasMany(e => e.OrderItems)
                    .WithOne(e => e.Order)
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ProductName).IsRequired().HasMaxLength(150);
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
                entity.Property(e => e.TotalPrice).HasPrecision(18, 2);
                entity.Property(e => e.CommissionAmount).HasPrecision(18, 2);
                entity.Property(e => e.MerchantEarnings).HasPrecision(18, 2);

                entity.Ignore(e => e.Product);

                entity.HasOne(e => e.Merchant)
                    .WithMany()
                    .HasForeignKey(e => e.MerchantId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Resturant>(entity =>
            {
                entity.Property(e => e.AverageRating).HasPrecision(3, 2);
                entity.Property(e => e.AddressTitle).HasMaxLength(250);
                entity.Property(e => e.DeliveryRadiusKm).HasDefaultValue(10.0);
                entity.Property(e => e.IsOpen).HasDefaultValue(true);
                entity.Property(e => e.MinOrderValue).HasPrecision(18, 2).HasDefaultValue(0.0m);
                entity.HasIndex(e => e.Name);
                entity.HasIndex(e => e.category);
            });

            modelBuilder.Entity<Dish>(entity =>
            {
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                entity.HasIndex(e => e.Name);
                entity.HasIndex(e => e.Price);
            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Rating).IsRequired();
                entity.Property(e => e.Comment).HasMaxLength(1000);

                entity.HasOne(e => e.Customer)
                    .WithMany()
                    .HasForeignKey(e => e.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Resturant)
                    .WithMany()
                    .HasForeignKey(e => e.ResturantId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Dish)
                    .WithMany()
                    .HasForeignKey(e => e.DishId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Order)
                    .WithMany()
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Amount).HasPrecision(18, 2);
                entity.Property(e => e.PlatformFee).HasPrecision(18, 2);
                entity.Property(e => e.MerchantEarnings).HasPrecision(18, 2);
                entity.Property(e => e.Currency).HasMaxLength(10);
                entity.Property(e => e.StripeCheckoutSessionId).HasMaxLength(255);
                entity.Property(e => e.StripePaymentIntentId).HasMaxLength(255);
                entity.Property(e => e.FailureReason).HasMaxLength(1000);

                entity.HasIndex(e => e.OrderId);
                entity.HasIndex(e => e.StripeCheckoutSessionId);
                entity.HasIndex(e => e.StripePaymentIntentId);

                entity.HasOne(e => e.Order)
                    .WithMany()
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Customer)
                    .WithMany()
                    .HasForeignKey(e => e.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Merchant)
                    .WithMany()
                    .HasForeignKey(e => e.MerchantId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ProcessedWebhookEvent>(entity =>
            {
                entity.HasKey(e => e.EventId);
                entity.Property(e => e.EventId).HasMaxLength(255);
                entity.Property(e => e.EventType).HasMaxLength(100);
            });
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var result = await base.SaveChangesAsync(cancellationToken);

            if (publisher is not null)
            {
                await PublishDomainEventsAsync(cancellationToken);
            }

            return result;
        }

        private async Task PublishDomainEventsAsync(CancellationToken cancellationToken)
        {
            var entities = ChangeTracker
                .Entries<Entity>()
                .Where(e => e.Entity.DomainEvents.Count != 0)
                .Select(e => e.Entity)
                .ToList();

            var domainEvents = entities
                .SelectMany(e => e.DomainEvents)
                .ToList();

            entities.ForEach(e => e.ClearDomainEvents());

            foreach (var domainEvent in domainEvents)
            {
                await publisher!.Publish(domainEvent, cancellationToken);
            }
        }
    }
}
