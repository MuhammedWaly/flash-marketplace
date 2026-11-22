using Microsoft.Extensions.Logging;
using Moq;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Payments.Commands.ProcessWebhook;
using Multi_Vendor_Marketplace.Application.Tests.TestHelpers;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Customer;
using Multi_Vendor_Marketplace.Domain.Merchant;
using Multi_Vendor_Marketplace.Domain.Order;
using Multi_Vendor_Marketplace.Domain.Payments;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace Multi_Vendor_Marketplace.Application.Tests.Payments
{
    public class ProcessStripeWebhookCommandHandlerTests
    {
        private readonly Mock<IStripeConnectService> _stripeConnectServiceMock = new();
        private readonly Mock<ILogger<ProcessStripeWebhookCommandHandler>> _loggerMock = new();

        [Fact]
        public async Task Handle_ShouldReturnInvalidSignature_WhenVerificationThrows()
        {
            // Arrange
            using var context = TestAppDbContext.CreateInMemoryContext();
            _stripeConnectServiceMock
                .Setup(s => s.VerifyAndParseWebhookEvent(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string?>()))
                .Throws(new Exception("Invalid signature"));

            var handler = new ProcessStripeWebhookCommandHandler(context, _stripeConnectServiceMock.Object, _loggerMock.Object);
            var command = new ProcessStripeWebhookCommand("raw_payload", "invalid_sig");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.IsError);
            Assert.Equal(PaymentError.WebhookSignatureInvalid.Code, result.TopError.Code);
        }

        [Fact]
        public async Task Handle_ShouldBeIdempotent_WhenEventAlreadyProcessed()
        {
            // Arrange
            using var context = TestAppDbContext.CreateInMemoryContext();
            var eventId = "evt_processed_already_123";

            context.ProcessedWebhookEvents.Add(new ProcessedWebhookEvent(eventId, "checkout.session.completed"));
            await context.SaveChangesAsync(CancellationToken.None);

            _stripeConnectServiceMock
                .Setup(s => s.VerifyAndParseWebhookEvent(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string?>()))
                .Returns(new StripeWebhookEventResult(
                    EventId: eventId,
                    EventType: "checkout.session.completed",
                    SessionId: "cs_123",
                    PaymentIntentId: "pi_123",
                    OrderId: Guid.NewGuid(),
                    AmountTotal: 100m,
                    Currency: "egp",
                    FailureReason: null,
                    IsPaymentSuccess: true,
                    IsPaymentFailure: false,
                    IsRefund: false
                ));

            var handler = new ProcessStripeWebhookCommandHandler(context, _stripeConnectServiceMock.Object, _loggerMock.Object);
            var command = new ProcessStripeWebhookCommand("raw_payload", "valid_sig");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result.IsError);
            Assert.Equal(1, context.ProcessedWebhookEvents.Count(e => e.EventId == eventId));
        }

        [Fact]
        public async Task Handle_ShouldMarkPaymentAndOrderPaid_WhenCheckoutSessionCompleted()
        {
            // Arrange
            using var context = TestAppDbContext.CreateInMemoryContext();
            var merchant = Merchant.Create(Guid.NewGuid(), "Burger Hub", "Owner", "o@test.com", "01000000000", "user-m", 10.0m).Value;
            var customer = Customer.Create(Guid.NewGuid(), "Ali", "Hassan", "ali@test.com", "01200000000", "user-c").Value;
            var order = Order.Create(Guid.NewGuid(), "ORD-200", customer.Id, null, 100m, 10m).Value;

            var paymentResult = Payment.Create(Guid.NewGuid(), order.Id, customer.Id, merchant.Id, 110m, "egp", 10m, 100m);
            var payment = paymentResult.Value;
            payment.SetCheckoutSession("cs_test_session_xyz");

            context.Merchants.Add(merchant);
            context.Customers.Add(customer);
            context.Orders.Add(order);
            context.Payments.Add(payment);
            await context.SaveChangesAsync(CancellationToken.None);

            var eventId = "evt_success_123";
            _stripeConnectServiceMock
                .Setup(s => s.VerifyAndParseWebhookEvent(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string?>()))
                .Returns(new StripeWebhookEventResult(
                    EventId: eventId,
                    EventType: "checkout.session.completed",
                    SessionId: "cs_test_session_xyz",
                    PaymentIntentId: "pi_test_success_999",
                    OrderId: order.Id,
                    AmountTotal: 110m,
                    Currency: "egp",
                    FailureReason: null,
                    IsPaymentSuccess: true,
                    IsPaymentFailure: false,
                    IsRefund: false
                ));

            var handler = new ProcessStripeWebhookCommandHandler(context, _stripeConnectServiceMock.Object, _loggerMock.Object);
            var command = new ProcessStripeWebhookCommand("raw_payload", "valid_sig");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result.IsError);

            var updatedOrder = context.Orders.First(o => o.Id == order.Id);
            Assert.Equal(PaymentStatus.Paid, updatedOrder.PaymentStatus);
            Assert.Equal(OrderStatus.Processing, updatedOrder.Status);

            var updatedPayment = context.Payments.First(p => p.Id == payment.Id);
            Assert.Equal(PaymentRecordStatus.Succeeded, updatedPayment.Status);
            Assert.Equal("pi_test_success_999", updatedPayment.StripePaymentIntentId);

            var updatedMerchant = context.Merchants.First(m => m.Id == merchant.Id);
            Assert.Equal(100m, updatedMerchant.Balance);

            Assert.True(context.ProcessedWebhookEvents.Any(e => e.EventId == eventId));
        }

        [Fact]
        public async Task Handle_ShouldMarkPaymentAndOrderFailed_WhenPaymentFails()
        {
            // Arrange
            using var context = TestAppDbContext.CreateInMemoryContext();
            var merchant = Merchant.Create(Guid.NewGuid(), "Burger Hub", "Owner", "o@test.com", "01000000000", "user-m", 10.0m).Value;
            var customer = Customer.Create(Guid.NewGuid(), "Ali", "Hassan", "ali@test.com", "01200000000", "user-c").Value;
            var order = Order.Create(Guid.NewGuid(), "ORD-201", customer.Id, null, 100m, 10m).Value;

            var payment = Payment.Create(Guid.NewGuid(), order.Id, customer.Id, merchant.Id, 110m, "egp", 10m, 100m).Value;
            payment.SetCheckoutSession("cs_failed_session");

            context.Merchants.Add(merchant);
            context.Customers.Add(customer);
            context.Orders.Add(order);
            context.Payments.Add(payment);
            await context.SaveChangesAsync(CancellationToken.None);

            var eventId = "evt_failed_456";
            _stripeConnectServiceMock
                .Setup(s => s.VerifyAndParseWebhookEvent(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string?>()))
                .Returns(new StripeWebhookEventResult(
                    EventId: eventId,
                    EventType: "payment_intent.payment_failed",
                    SessionId: "cs_failed_session",
                    PaymentIntentId: "pi_failed_999",
                    OrderId: order.Id,
                    AmountTotal: 110m,
                    Currency: "egp",
                    FailureReason: "Card declined: insufficient funds",
                    IsPaymentSuccess: false,
                    IsPaymentFailure: true,
                    IsRefund: false
                ));

            var handler = new ProcessStripeWebhookCommandHandler(context, _stripeConnectServiceMock.Object, _loggerMock.Object);
            var command = new ProcessStripeWebhookCommand("raw_payload", "valid_sig");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result.IsError);

            var updatedOrder = context.Orders.First(o => o.Id == order.Id);
            Assert.Equal(PaymentStatus.Failed, updatedOrder.PaymentStatus);

            var updatedPayment = context.Payments.First(p => p.Id == payment.Id);
            Assert.Equal(PaymentRecordStatus.Failed, updatedPayment.Status);
            Assert.Equal("Card declined: insufficient funds", updatedPayment.FailureReason);
        }

        [Fact]
        public async Task Handle_ShouldMarkPaymentAndOrderRefunded_WhenChargeRefunded()
        {
            // Arrange
            using var context = TestAppDbContext.CreateInMemoryContext();
            var merchant = Merchant.Create(Guid.NewGuid(), "Burger Hub", "Owner", "o@test.com", "01000000000", "user-m", 10.0m).Value;
            var customer = Customer.Create(Guid.NewGuid(), "Ali", "Hassan", "ali@test.com", "01200000000", "user-c").Value;
            var order = Order.Create(Guid.NewGuid(), "ORD-202", customer.Id, null, 100m, 10m).Value;
            order.UpdatePaymentStatus(PaymentStatus.Paid);

            var payment = Payment.Create(Guid.NewGuid(), order.Id, customer.Id, merchant.Id, 110m, "egp", 10m, 100m).Value;
            payment.MarkAsSucceeded("pi_success_123");

            context.Merchants.Add(merchant);
            context.Customers.Add(customer);
            context.Orders.Add(order);
            context.Payments.Add(payment);
            await context.SaveChangesAsync(CancellationToken.None);

            var eventId = "evt_refund_789";
            _stripeConnectServiceMock
                .Setup(s => s.VerifyAndParseWebhookEvent(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string?>()))
                .Returns(new StripeWebhookEventResult(
                    EventId: eventId,
                    EventType: "charge.refunded",
                    SessionId: null,
                    PaymentIntentId: "pi_success_123",
                    OrderId: order.Id,
                    AmountTotal: 110m,
                    Currency: "egp",
                    FailureReason: null,
                    IsPaymentSuccess: false,
                    IsPaymentFailure: false,
                    IsRefund: true
                ));

            var handler = new ProcessStripeWebhookCommandHandler(context, _stripeConnectServiceMock.Object, _loggerMock.Object);
            var command = new ProcessStripeWebhookCommand("raw_payload", "valid_sig");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result.IsError);

            var updatedOrder = context.Orders.First(o => o.Id == order.Id);
            Assert.Equal(PaymentStatus.Refunded, updatedOrder.PaymentStatus);

            var updatedPayment = context.Payments.First(p => p.Id == payment.Id);
            Assert.Equal(PaymentRecordStatus.Refunded, updatedPayment.Status);
        }
    }
}
