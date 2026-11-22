using Moq;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Payments.Queries.GetPaymentStatus;
using Multi_Vendor_Marketplace.Application.Features.Vendor.Commands.StripeOnboarding;
using Multi_Vendor_Marketplace.Application.Features.Vendor.Queries.GetStripeStatus;
using Multi_Vendor_Marketplace.Application.Tests.TestHelpers;
using Multi_Vendor_Marketplace.Domain.Customer;
using Multi_Vendor_Marketplace.Domain.Merchant;
using Multi_Vendor_Marketplace.Domain.Order;
using Multi_Vendor_Marketplace.Domain.Payments;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace Multi_Vendor_Marketplace.Application.Tests.Vendor
{
    public class VendorStripeTests
    {
        private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
        private readonly Mock<IStripeConnectService> _stripeConnectServiceMock = new();

        [Fact]
        public async Task GetSellerStripeStatus_ShouldReturnNotConnected_WhenMerchantHasNoStripeAccount()
        {
            // Arrange
            using var context = TestAppDbContext.CreateInMemoryContext();
            var userId = "vendor-user-1";
            _currentUserServiceMock.Setup(s => s.UserId).Returns(userId);

            var merchant = Merchant.Create(Guid.NewGuid(), "Pizza Plaza", "Owner", "pizza@test.com", "01011111111", userId, 12.0m).Value;
            context.Merchants.Add(merchant);
            await context.SaveChangesAsync(CancellationToken.None);

            var handler = new GetSellerStripeStatusQueryHandler(context, _currentUserServiceMock.Object, _stripeConnectServiceMock.Object);
            var query = new GetSellerStripeStatusQuery();

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.False(result.IsError);
            Assert.False(result.Value.IsConnected);
            Assert.Null(result.Value.AccountId);
            Assert.Contains("No Stripe account connected", result.Value.Requirements);
        }

        [Fact]
        public async Task GetSellerStripeStatus_ShouldSyncStatus_WhenStripeAccountExists()
        {
            // Arrange
            using var context = TestAppDbContext.CreateInMemoryContext();
            var userId = "vendor-user-1";
            _currentUserServiceMock.Setup(s => s.UserId).Returns(userId);

            var merchant = Merchant.Create(Guid.NewGuid(), "Pizza Plaza", "Owner", "pizza@test.com", "01011111111", userId, 12.0m).Value;
            merchant.SetStripeAccountId("acct_existing_999");
            context.Merchants.Add(merchant);
            await context.SaveChangesAsync(CancellationToken.None);

            _stripeConnectServiceMock
                .Setup(s => s.GetAccountStatusAsync("acct_existing_999", It.IsAny<CancellationToken>()))
                .ReturnsAsync(new StripeAccountStatusDto(
                    AccountId: "acct_existing_999",
                    IsConnected: true,
                    ChargesEnabled: true,
                    PayoutsEnabled: true,
                    DetailsSubmitted: true,
                    RequirementsMessage: null
                ));

            var handler = new GetSellerStripeStatusQueryHandler(context, _currentUserServiceMock.Object, _stripeConnectServiceMock.Object);
            var query = new GetSellerStripeStatusQuery();

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.False(result.IsError);
            Assert.True(result.Value.IsConnected);
            Assert.True(result.Value.ChargesEnabled);
            Assert.True(result.Value.PayoutsEnabled);

            var updatedMerchant = context.Merchants.First(m => m.Id == merchant.Id);
            Assert.True(updatedMerchant.IsStripeChargesEnabled);
            Assert.True(updatedMerchant.IsStripePayoutsEnabled);
            Assert.True(updatedMerchant.StripeOnboardingCompleted);
        }

        [Fact]
        public async Task CreateStripeOnboardingLink_ShouldCreateExpressAccount_WhenNotYetCreated()
        {
            // Arrange
            using var context = TestAppDbContext.CreateInMemoryContext();
            var userId = "vendor-user-new";
            _currentUserServiceMock.Setup(s => s.UserId).Returns(userId);

            var merchant = Merchant.Create(Guid.NewGuid(), "Taco Express", "Taco Guy", "taco@test.com", "01022222222", userId, 10.0m).Value;
            context.Merchants.Add(merchant);
            await context.SaveChangesAsync(CancellationToken.None);

            _stripeConnectServiceMock
                .Setup(s => s.CreateExpressConnectedAccountAsync(merchant.Email, merchant.StoreName, It.IsAny<CancellationToken>()))
                .ReturnsAsync("acct_newly_created_123");

            _stripeConnectServiceMock
                .Setup(s => s.CreateAccountOnboardingLinkAsync("acct_newly_created_123", It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync("https://connect.stripe.com/setup/s/link123");

            var handler = new CreateStripeOnboardingLinkCommandHandler(context, _currentUserServiceMock.Object, _stripeConnectServiceMock.Object);
            var command = new CreateStripeOnboardingLinkCommand();

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result.IsError);
            Assert.Equal("https://connect.stripe.com/setup/s/link123", result.Value.OnboardingUrl);
            Assert.Equal("acct_newly_created_123", result.Value.AccountId);

            var updatedMerchant = context.Merchants.First(m => m.Id == merchant.Id);
            Assert.Equal("acct_newly_created_123", updatedMerchant.StripeAccountId);
        }

        [Fact]
        public async Task GetPaymentStatus_ShouldReturnPaymentDetails_WhenAuthorized()
        {
            // Arrange
            using var context = TestAppDbContext.CreateInMemoryContext();
            var userId = "customer-user-1";
            _currentUserServiceMock.Setup(s => s.UserId).Returns(userId);

            var customer = Customer.Create(Guid.NewGuid(), "Customer", "One", "cust1@test.com", "01033333333", userId).Value;
            var order = Order.Create(Guid.NewGuid(), "ORD-500", customer.Id, null, 250m, 30m).Value;
            order.UpdatePaymentStatus(PaymentStatus.Paid);

            var payment = Payment.Create(Guid.NewGuid(), order.Id, customer.Id, Guid.NewGuid(), 280m, "egp", 25m, 255m).Value;
            payment.MarkAsSucceeded("pi_paid_555");

            context.Customers.Add(customer);
            context.Orders.Add(order);
            context.Payments.Add(payment);
            await context.SaveChangesAsync(CancellationToken.None);

            var handler = new GetPaymentStatusQueryHandler(context, _currentUserServiceMock.Object);
            var query = new GetPaymentStatusQuery(order.Id);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.False(result.IsError);
            Assert.Equal(order.Id, result.Value.OrderId);
            Assert.Equal("Paid", result.Value.PaymentStatus);
            Assert.Equal("pi_paid_555", result.Value.StripePaymentIntentId);
            Assert.Equal(280m, result.Value.Amount);
        }
    }
}
