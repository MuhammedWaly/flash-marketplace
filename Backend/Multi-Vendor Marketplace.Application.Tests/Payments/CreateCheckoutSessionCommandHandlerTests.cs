using Moq;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Payments.Commands.CreateCheckoutSession;
using Multi_Vendor_Marketplace.Application.Tests.TestHelpers;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Customer;
using Multi_Vendor_Marketplace.Domain.Merchant;
using Multi_Vendor_Marketplace.Domain.Order;
using Multi_Vendor_Marketplace.Domain.OrderItem;
using Multi_Vendor_Marketplace.Domain.Payments;
using Multi_Vendor_Marketplace.Domain.Resturants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace Multi_Vendor_Marketplace.Application.Tests.Payments
{
    public class CreateCheckoutSessionCommandHandlerTests
    {
        private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
        private readonly Mock<IStripeConnectService> _stripeConnectServiceMock = new();

        [Fact]
        public async Task Handle_ShouldReturnUnauthorized_WhenUserNotAuthenticated()
        {
            // Arrange
            using var context = TestAppDbContext.CreateInMemoryContext();
            _currentUserServiceMock.Setup(s => s.UserId).Returns((string?)null);

            var handler = new CreateCheckoutSessionCommandHandler(context, _currentUserServiceMock.Object, _stripeConnectServiceMock.Object);
            var command = new CreateCheckoutSessionCommand(Guid.NewGuid());

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.IsError);
            Assert.Equal("User.Unauthorized", result.TopError.Code);
        }

        [Fact]
        public async Task Handle_ShouldReturnNotFound_WhenOrderDoesNotExist()
        {
            // Arrange
            using var context = TestAppDbContext.CreateInMemoryContext();
            var userId = "user-123";
            _currentUserServiceMock.Setup(s => s.UserId).Returns(userId);

            var customer = Customer.Create(Guid.NewGuid(), "Ahmed", "Ali", "ahmed@example.com", "01000000000", userId).Value;
            context.Customers.Add(customer);
            await context.SaveChangesAsync(CancellationToken.None);

            var handler = new CreateCheckoutSessionCommandHandler(context, _currentUserServiceMock.Object, _stripeConnectServiceMock.Object);
            var command = new CreateCheckoutSessionCommand(Guid.NewGuid());

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.IsError);
            Assert.Equal("Order.NotFound", result.TopError.Code);
        }

        [Fact]
        public async Task Handle_ShouldReturnUnauthorizedCustomer_WhenOrderBelongsToAnotherCustomer()
        {
            // Arrange
            using var context = TestAppDbContext.CreateInMemoryContext();
            var currentUserId = "user-current";
            _currentUserServiceMock.Setup(s => s.UserId).Returns(currentUserId);

            var customer = Customer.Create(Guid.NewGuid(), "Ahmed", "Ali", "ahmed@example.com", "01000000000", currentUserId).Value;
            context.Customers.Add(customer);

            var order = Order.Create(Guid.NewGuid(), "ORD-100", Guid.NewGuid(), null, 150m, 20m).Value;
            context.Orders.Add(order);
            await context.SaveChangesAsync(CancellationToken.None);

            var handler = new CreateCheckoutSessionCommandHandler(context, _currentUserServiceMock.Object, _stripeConnectServiceMock.Object);
            var command = new CreateCheckoutSessionCommand(order.Id);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.IsError);
            Assert.Equal(PaymentError.UnauthorizedCustomer.Code, result.TopError.Code);
        }

        [Fact]
        public async Task Handle_ShouldReturnConflict_WhenOrderIsAlreadyPaid()
        {
            // Arrange
            using var context = TestAppDbContext.CreateInMemoryContext();
            var userId = "user-123";
            _currentUserServiceMock.Setup(s => s.UserId).Returns(userId);

            var customer = Customer.Create(Guid.NewGuid(), "Ahmed", "Ali", "ahmed@example.com", "01000000000", userId).Value;
            context.Customers.Add(customer);

            var order = Order.Create(Guid.NewGuid(), "ORD-101", customer.Id, null, 150m, 20m).Value;
            order.UpdatePaymentStatus(PaymentStatus.Paid);
            context.Orders.Add(order);
            await context.SaveChangesAsync(CancellationToken.None);

            var handler = new CreateCheckoutSessionCommandHandler(context, _currentUserServiceMock.Object, _stripeConnectServiceMock.Object);
            var command = new CreateCheckoutSessionCommand(order.Id);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.IsError);
            Assert.Equal(PaymentError.AlreadyPaid.Code, result.TopError.Code);
        }

        [Fact]
        public async Task Handle_ShouldReturnConflict_WhenSellerNotOnboarded()
        {
            // Arrange
            using var context = TestAppDbContext.CreateInMemoryContext();
            var userId = "user-123";
            _currentUserServiceMock.Setup(s => s.UserId).Returns(userId);

            var customer = Customer.Create(Guid.NewGuid(), "Ahmed", "Ali", "ahmed@example.com", "01000000000", userId).Value;
            context.Customers.Add(customer);

            var merchant = Merchant.Create(Guid.NewGuid(), "Burger Store", "Owner 1", "owner@example.com", "01100000000", "vendor-user-1", 10.0m).Value;
            context.Merchants.Add(merchant);

            var order = Order.Create(Guid.NewGuid(), "ORD-102", customer.Id, null, 150m, 20m).Value;
            var orderItem = OrderItem.Create(Guid.NewGuid(), order.Id, Guid.NewGuid(), merchant.Id, "Double Burger", 150m, 1, 10.0m).Value;
            order.OrderItems.Add(orderItem);

            context.Orders.Add(order);
            await context.SaveChangesAsync(CancellationToken.None);

            var handler = new CreateCheckoutSessionCommandHandler(context, _currentUserServiceMock.Object, _stripeConnectServiceMock.Object);
            var command = new CreateCheckoutSessionCommand(order.Id);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.IsError);
            Assert.Equal("Payment.SellerNotOnboarded", result.TopError.Code);
        }

        [Fact]
        public async Task Handle_ShouldReturnConflict_WhenSellerChargesDisabled()
        {
            // Arrange
            using var context = TestAppDbContext.CreateInMemoryContext();
            var userId = "user-123";
            _currentUserServiceMock.Setup(s => s.UserId).Returns(userId);

            var customer = Customer.Create(Guid.NewGuid(), "Ahmed", "Ali", "ahmed@example.com", "01000000000", userId).Value;
            context.Customers.Add(customer);

            var merchant = Merchant.Create(Guid.NewGuid(), "Burger Store", "Owner 1", "owner@example.com", "01100000000", "vendor-user-1", 10.0m).Value;
            merchant.SetStripeAccountId("acct_test123");
            context.Merchants.Add(merchant);

            var order = Order.Create(Guid.NewGuid(), "ORD-103", customer.Id, null, 150m, 20m).Value;
            var orderItem = OrderItem.Create(Guid.NewGuid(), order.Id, Guid.NewGuid(), merchant.Id, "Double Burger", 150m, 1, 10.0m).Value;
            order.OrderItems.Add(orderItem);

            context.Orders.Add(order);
            await context.SaveChangesAsync(CancellationToken.None);

            _stripeConnectServiceMock
                .Setup(s => s.GetAccountStatusAsync("acct_test123", It.IsAny<CancellationToken>()))
                .ReturnsAsync(new StripeAccountStatusDto(
                    AccountId: "acct_test123",
                    IsConnected: true,
                    ChargesEnabled: false,
                    PayoutsEnabled: false,
                    DetailsSubmitted: false,
                    RequirementsMessage: "Identity verification pending"
                ));

            var handler = new CreateCheckoutSessionCommandHandler(context, _currentUserServiceMock.Object, _stripeConnectServiceMock.Object);
            var command = new CreateCheckoutSessionCommand(order.Id);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.IsError);
            Assert.Equal("Payment.SellerChargesDisabled", result.TopError.Code);
        }

        [Fact]
        public async Task Handle_ShouldCreateStripeSessionAndPaymentRecord_WhenValid()
        {
            // Arrange
            using var context = TestAppDbContext.CreateInMemoryContext();
            var userId = "user-123";
            _currentUserServiceMock.Setup(s => s.UserId).Returns(userId);

            var customer = Customer.Create(Guid.NewGuid(), "Ahmed", "Ali", "ahmed@example.com", "01000000000", userId).Value;
            context.Customers.Add(customer);

            var merchant = Merchant.Create(Guid.NewGuid(), "Burger Store", "Owner 1", "owner@example.com", "01100000000", "vendor-user-1", 10.0m).Value;
            merchant.SetStripeAccountId("acct_ready123");
            context.Merchants.Add(merchant);

            var order = Order.Create(Guid.NewGuid(), "ORD-104", customer.Id, null, 200m, 20m).Value;
            var orderItem = OrderItem.Create(Guid.NewGuid(), order.Id, Guid.NewGuid(), merchant.Id, "Double Burger", 200m, 1, 10.0m).Value;
            order.OrderItems.Add(orderItem);

            context.Orders.Add(order);
            await context.SaveChangesAsync(CancellationToken.None);

            _stripeConnectServiceMock
                .Setup(s => s.GetAccountStatusAsync("acct_ready123", It.IsAny<CancellationToken>()))
                .ReturnsAsync(new StripeAccountStatusDto(
                    AccountId: "acct_ready123",
                    IsConnected: true,
                    ChargesEnabled: true,
                    PayoutsEnabled: true,
                    DetailsSubmitted: true,
                    RequirementsMessage: null
                ));

            _stripeConnectServiceMock
                .Setup(s => s.CreateDestinationCheckoutSessionAsync(It.IsAny<CreateStripeCheckoutSessionParams>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new StripeCheckoutSessionResult("cs_test_session_abc", "https://checkout.stripe.com/pay/cs_test_session_abc", null));

            var handler = new CreateCheckoutSessionCommandHandler(context, _currentUserServiceMock.Object, _stripeConnectServiceMock.Object);
            var command = new CreateCheckoutSessionCommand(order.Id);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result.IsError);
            Assert.Equal("cs_test_session_abc", result.Value.SessionId);
            Assert.Equal("https://checkout.stripe.com/pay/cs_test_session_abc", result.Value.CheckoutUrl);

            var savedPayment = context.Payments.FirstOrDefault(p => p.OrderId == order.Id);
            Assert.NotNull(savedPayment);
            Assert.Equal("cs_test_session_abc", savedPayment.StripeCheckoutSessionId);
            Assert.Equal(220m, savedPayment.Amount); // SubTotal 200 + Shipping 20
            Assert.Equal(20m, savedPayment.PlatformFee); // 10% commission on 200
            Assert.Equal(200m, savedPayment.MerchantEarnings);
        }
    }
}
