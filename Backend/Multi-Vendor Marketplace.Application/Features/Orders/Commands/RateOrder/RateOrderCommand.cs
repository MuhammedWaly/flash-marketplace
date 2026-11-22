using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Reviews.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Orders.Commands.RateOrder
{
    public record RateOrderCommand(
        Guid OrderId,
        int Rating,
        string? Comment
    ) : IRequest<Result<ReviewDto>>;
}
