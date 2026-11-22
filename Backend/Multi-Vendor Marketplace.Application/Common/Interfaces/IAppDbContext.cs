using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
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

namespace Multi_Vendor_Marketplace.Application.Common.Interfaces
{
    public interface IAppDbContext
    {
        DbSet<Resturant> Resturants { get; }
        DbSet<Dish> Dishes { get; }
        DbSet<RefreshToken> RefreshTokens { get; }
        DbSet<Customer> Customers { get; }
        DbSet<Merchant> Merchants { get; }
        DbSet<Order> Orders { get; }
        DbSet<OrderItem> OrderItems { get; }
        DbSet<Review> Reviews { get; }
        DbSet<Payment> Payments { get; }
        DbSet<ProcessedWebhookEvent> ProcessedWebhookEvents { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
        Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
    }
}
