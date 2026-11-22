using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Payments.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Payments;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Payments.Queries.GetPaymentStatus
{
    public record GetPaymentStatusQuery(Guid OrderId) : IRequest<Result<PaymentStatusDto>>;

    public class GetPaymentStatusQueryHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<GetPaymentStatusQuery, Result<PaymentStatusDto>>
    {
        public async Task<Result<PaymentStatusDto>> Handle(GetPaymentStatusQuery request, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            var order = await context.Orders
                .AsNoTracking()
                .Include(o => o.Customer)
                .Include(o => o.Resturant)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

            if (order is null)
            {
                return Error.NotFound("Order.NotFound", "The requested order was not found.");
            }

            // Verify access: Customer who owns the order OR Vendor who owns the restaurant OR Admin
            var isCustomerOwner = order.Customer?.UserId == userId;
            var isRestaurantOwner = order.Resturant?.OwnerId == userId;
            var isAdmin = currentUserService.IsAdmin;

            if (!isCustomerOwner && !isRestaurantOwner && !isAdmin)
            {
                return PaymentError.UnauthorizedCustomer;
            }

            var payment = await context.Payments
                .AsNoTracking()
                .Where(p => p.OrderId == order.Id)
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            return new PaymentStatusDto(
                order.Id,
                order.OrderNumber,
                order.Status.ToString(),
                order.PaymentStatus.ToString(),
                payment?.Amount ?? order.TotalAmount,
                payment?.Currency ?? "egp",
                payment?.StripePaymentIntentId,
                payment?.FailureReason,
                payment?.CreatedAt ?? order.CreatedAt,
                payment?.UpdatedAt
            );
        }
    }
}
