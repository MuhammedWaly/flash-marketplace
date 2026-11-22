using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Order;
using Multi_Vendor_Marketplace.Domain.Payments;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Payments.Commands.ProcessWebhook
{
    public record ProcessStripeWebhookCommand(
        string RawBody,
        string SignatureHeader
    ) : IRequest<Result<Success>>;

    public class ProcessStripeWebhookCommandHandler(
        IAppDbContext context,
        IStripeConnectService stripeConnectService,
        ILogger<ProcessStripeWebhookCommandHandler> logger) : IRequestHandler<ProcessStripeWebhookCommand, Result<Success>>
    {
        public async Task<Result<Success>> Handle(ProcessStripeWebhookCommand request, CancellationToken cancellationToken)
        {
            StripeWebhookEventResult eventResult;
            try
            {
                eventResult = stripeConnectService.VerifyAndParseWebhookEvent(request.RawBody, request.SignatureHeader);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Stripe webhook signature verification failed.");
                return PaymentError.WebhookSignatureInvalid;
            }

            // 1. Idempotency Check: Verify if event was already processed
            var alreadyProcessed = await context.ProcessedWebhookEvents
                .AsNoTracking()
                .AnyAsync(e => e.EventId == eventResult.EventId, cancellationToken);

            if (alreadyProcessed)
            {
                logger.LogInformation("Stripe event {EventId} ({EventType}) has already been processed. Skipping.", eventResult.EventId, eventResult.EventType);
                return Result.Success;
            }

            // 2. Process Within an Atomic Database Transaction
            await using var transaction = await context.BeginTransactionAsync(cancellationToken);

            try
            {
                // Register event as processed
                context.ProcessedWebhookEvents.Add(new ProcessedWebhookEvent(eventResult.EventId, eventResult.EventType));

                // 3. Locate target Payment and Order
                Payment? payment = null;

                if (!string.IsNullOrWhiteSpace(eventResult.SessionId))
                {
                    payment = await context.Payments
                        .Include(p => p.Order)
                        .Include(p => p.Merchant)
                        .FirstOrDefaultAsync(p => p.StripeCheckoutSessionId == eventResult.SessionId, cancellationToken);
                }

                if (payment is null && !string.IsNullOrWhiteSpace(eventResult.PaymentIntentId))
                {
                    payment = await context.Payments
                        .Include(p => p.Order)
                        .Include(p => p.Merchant)
                        .FirstOrDefaultAsync(p => p.StripePaymentIntentId == eventResult.PaymentIntentId, cancellationToken);
                }

                if (payment is null && eventResult.OrderId.HasValue)
                {
                    payment = await context.Payments
                        .Include(p => p.Order)
                        .Include(p => p.Merchant)
                        .Where(p => p.OrderId == eventResult.OrderId.Value)
                        .OrderByDescending(p => p.CreatedAt)
                        .FirstOrDefaultAsync(cancellationToken);
                }

                Order? order = payment?.Order;
                if (order is null && eventResult.OrderId.HasValue)
                {
                    order = await context.Orders
                        .FirstOrDefaultAsync(o => o.Id == eventResult.OrderId.Value, cancellationToken);
                }

                // 4. Handle Specific Event Outcomes
                if (eventResult.IsPaymentSuccess)
                {
                    if (payment != null)
                    {
                        payment.MarkAsSucceeded(eventResult.PaymentIntentId);

                        // Credit seller balance in local ledger
                        if (payment.Merchant != null && payment.MerchantEarnings > 0)
                        {
                            payment.Merchant.AdjustBalance(payment.MerchantEarnings);
                        }
                    }

                    if (order != null && order.PaymentStatus != PaymentStatus.Paid)
                    {
                        order.UpdatePaymentStatus(PaymentStatus.Paid);
                        if (order.Status == OrderStatus.Pending)
                        {
                            order.UpdateStatus(OrderStatus.Processing); // Advance to restaurant preparation
                        }
                    }

                    logger.LogInformation("Payment succeeded for Order {OrderId} via event {EventId}", order?.Id ?? payment?.OrderId, eventResult.EventId);
                }
                else if (eventResult.IsPaymentFailure)
                {
                    payment?.MarkAsFailed(eventResult.FailureReason ?? "Payment failed", eventResult.PaymentIntentId);

                    if (order != null && order.PaymentStatus != PaymentStatus.Paid)
                    {
                        order.UpdatePaymentStatus(PaymentStatus.Failed);
                    }

                    logger.LogWarning("Payment failed for Order {OrderId} via event {EventId}: {Reason}", order?.Id ?? payment?.OrderId, eventResult.EventId, eventResult.FailureReason);
                }
                else if (eventResult.IsRefund)
                {
                    payment?.MarkAsRefunded();

                    if (order != null)
                    {
                        order.UpdatePaymentStatus(PaymentStatus.Refunded);
                    }

                    logger.LogInformation("Payment refunded for Order {OrderId} via event {EventId}", order?.Id ?? payment?.OrderId, eventResult.EventId);
                }

                await context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                return Result.Success;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                logger.LogError(ex, "Failed to process Stripe webhook event {EventId}: {Message}", eventResult.EventId, ex.Message);
                throw;
            }
        }
    }
}
