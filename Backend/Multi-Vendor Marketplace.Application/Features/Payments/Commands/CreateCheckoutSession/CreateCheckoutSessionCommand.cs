using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Payments.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Order;
using Multi_Vendor_Marketplace.Domain.Payments;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Payments.Commands.CreateCheckoutSession
{
    public record CreateCheckoutSessionCommand(Guid OrderId) : IRequest<Result<CheckoutSessionDto>>;

    public class CreateCheckoutSessionCommandValidator : AbstractValidator<CreateCheckoutSessionCommand>
    {
        public CreateCheckoutSessionCommandValidator()
        {
            RuleFor(x => x.OrderId).NotEmpty().WithMessage("OrderId is required.");
        }
    }

    public class CreateCheckoutSessionCommandHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService,
        IStripeConnectService stripeConnectService) : IRequestHandler<CreateCheckoutSessionCommand, Result<CheckoutSessionDto>>
    {
        public async Task<Result<CheckoutSessionDto>> Handle(CreateCheckoutSessionCommand request, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            // 1. Authenticate Customer Profile
            var customer = await context.Customers
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

            if (customer is null)
            {
                return Error.NotFound("Customer.NotFound", "Customer profile was not found.");
            }

            // 2. Load Order with Items & Restaurant
            var order = await context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Resturant)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

            if (order is null)
            {
                return Error.NotFound("Order.NotFound", "The requested order was not found.");
            }

            // 3. Verify Order Ownership
            if (order.CustomerId != customer.Id)
            {
                return PaymentError.UnauthorizedCustomer;
            }

            // 4. Verify Payment Eligibility
            if (order.PaymentStatus == PaymentStatus.Paid)
            {
                return PaymentError.AlreadyPaid;
            }

            if (order.Status == OrderStatus.Cancelled)
            {
                return PaymentError.OrderNotEligible;
            }

            // 5. Check if a succeeded payment already exists for this order
            var alreadyPaid = await context.Payments
                .AsNoTracking()
                .AnyAsync(p => p.OrderId == order.Id && p.Status == PaymentRecordStatus.Succeeded, cancellationToken);

            if (alreadyPaid)
            {
                return PaymentError.AlreadyPaid;
            }

            // 6. Identify the Seller / Merchant
            var merchantId = order.OrderItems.FirstOrDefault()?.MerchantId;
            Domain.Merchant.Merchant? merchant = null;

            if (merchantId.HasValue && merchantId.Value != Guid.Empty)
            {
                merchant = await context.Merchants
                    .FirstOrDefaultAsync(m => m.Id == merchantId.Value, cancellationToken);
            }

            if (merchant is null && order.Resturant != null)
            {
                merchant = await context.Merchants
                    .FirstOrDefaultAsync(m => m.UserId == order.Resturant.OwnerId, cancellationToken);
            }

            if (merchant is null)
            {
                return Error.NotFound("Merchant.NotFound", "Seller/Merchant information for this order could not be located.");
            }

            // 7. Verify Seller's Connected Stripe Account & Readiness
            string? destinationAccountId = null;

            if (!string.IsNullOrWhiteSpace(merchant.StripeAccountId))
            {
                var accountStatus = await stripeConnectService.GetAccountStatusAsync(merchant.StripeAccountId, cancellationToken);
                if (accountStatus.ChargesEnabled)
                {
                    destinationAccountId = merchant.StripeAccountId;
                }
                else if (!stripeConnectService.AllowTestCheckoutWithoutSeller)
                {
                    return Error.Conflict(
                        "Payment.SellerChargesDisabled",
                        $"The restaurant's Stripe account is not active or has pending verification requirements ({accountStatus.RequirementsMessage ?? "Charges not enabled"})."
                    );
                }
            }
            else if (!stripeConnectService.AllowTestCheckoutWithoutSeller)
            {
                return Error.Conflict(
                    "Payment.SellerNotOnboarded",
                    $"The restaurant '{order.Resturant?.Name ?? merchant.StoreName}' has not completed Stripe onboarding yet and cannot accept card payments."
                );
            }

            // 8. Calculate Financials from Trusted Database Values
            var totalAmount = order.TotalAmount;
            var platformFee = order.OrderItems.Sum(i => i.CommissionAmount);
            if (platformFee <= 0)
            {
                var rate = merchant.CommissionRate > 0 ? merchant.CommissionRate : 12.0m;
                platformFee = Math.Round(order.SubTotal * (rate / 100m), 2);
            }

            var merchantEarnings = totalAmount - platformFee;

            // 9. Create or Reuse Payment Record
            var payment = await context.Payments
                .FirstOrDefaultAsync(p => p.OrderId == order.Id && p.Status == PaymentRecordStatus.Pending, cancellationToken);

            if (payment is null)
            {
                var paymentResult = Payment.Create(
                    Guid.NewGuid(),
                    order.Id,
                    customer.Id,
                    merchant.Id,
                    totalAmount,
                    "egp",
                    platformFee,
                    merchantEarnings
                );

                if (paymentResult.IsError)
                {
                    return paymentResult.Errors;
                }

                payment = paymentResult.Value;
                context.Payments.Add(payment);
            }

            await context.SaveChangesAsync(cancellationToken);

            // 10. Create Stripe Destination Checkout Session
            var lineItems = order.OrderItems.Select(item => new StripeCheckoutItem(
                item.ProductName,
                item.UnitPrice,
                item.Quantity
            )).ToList();

            var sessionParams = new CreateStripeCheckoutSessionParams(
                order.Id,
                order.OrderNumber,
                totalAmount,
                "egp",
                platformFee,
                destinationAccountId,
                customer.Email,
                lineItems,
                SuccessUrl: $"http://localhost:5173/payment/success?orderId={order.Id}&session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl: $"http://localhost:5173/checkout?orderId={order.Id}"
            );

            StripeCheckoutSessionResult sessionResult;
            try
            {
                sessionResult = await stripeConnectService.CreateDestinationCheckoutSessionAsync(sessionParams, cancellationToken);
            }
            catch (System.Exception ex)
            {
                return Error.Conflict("Stripe.CheckoutSessionFailed", ex.Message);
            }

            // 11. Update Payment with Session ID
            payment.SetCheckoutSession(sessionResult.SessionId);
            order.UpdatePaymentStatus(PaymentStatus.Pending);
            await context.SaveChangesAsync(cancellationToken);

            return new CheckoutSessionDto(
                sessionResult.SessionId,
                sessionResult.CheckoutUrl,
                order.Id
            );
        }
    }
}
