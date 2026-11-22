using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Common.Utilities;
using Multi_Vendor_Marketplace.Application.Features.Orders.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Order;
using Multi_Vendor_Marketplace.Domain.OrderItem;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Orders.Commands.Checkout
{
    public class CheckoutCommandHandler(
        ICartService cartService,
        IAppDbContext context,
        ICurrentUserService currentUserService,
        IOrderNotificationService orderNotificationService) : IRequestHandler<CheckoutCommand, Result<OrderDto>>
    {
        public async Task<Result<OrderDto>> Handle(CheckoutCommand command, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            // 1. Fetch Cart from HybridCache
            var cart = await cartService.GetCartAsync(userId, cancellationToken);
            if (cart.Items.Count == 0 || !cart.ResturantId.HasValue)
            {
                return Error.Validation("Cart.Empty", "Your cart is empty. Please add items before checking out.");
            }

            // 2. Load Customer Profile
            var customer = await context.Customers
                .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

            if (customer is null)
            {
                return Error.NotFound("Customer.NotFound", "Customer profile was not found. Please complete your registration.");
            }

            // 3. Load Restaurant & Merchant Owner
            var resturant = await context.Resturants
                .FirstOrDefaultAsync(r => r.Id == cart.ResturantId.Value, cancellationToken);

            if (resturant is null)
            {
                return Error.NotFound("Resturant.NotFound", "The selected restaurant was not found or is no longer available.");
            }

            var merchant = await context.Merchants
                .FirstOrDefaultAsync(m => m.UserId == resturant.OwnerId, cancellationToken);

            // 4. Re-Validation of Real-Time Dishes & Prices from Database
            var dishIds = cart.Items.Select(i => i.DishId).Distinct().ToList();
            var currentDishes = await context.Dishes
                .Where(d => dishIds.Contains(d.Id) && d.ResturantId == resturant.Id)
                .ToDictionaryAsync(d => d.Id, cancellationToken);

            if (currentDishes.Count != dishIds.Count)
            {
                return Error.Conflict("Order.DishesUnavailable", "One or more dishes in your cart are no longer available on the restaurant's menu.");
            }

            // 5. Detect Any Price Changes (Protect the customer & store)
            var priceChanges = new List<string>();
            foreach (var cartItem in cart.Items)
            {
                if (currentDishes.TryGetValue(cartItem.DishId, out var currentDish))
                {
                    if (currentDish.Price != cartItem.UnitPrice)
                    {
                        priceChanges.Add($"'{currentDish.Name}' was {cartItem.UnitPrice:F2} EGP, now {currentDish.Price:F2} EGP");
                        cartItem.UnitPrice = currentDish.Price; // refresh price in cache
                    }
                }
            }

            if (priceChanges.Count != 0)
            {
                // Update the cache so the customer sees fresh prices upon reviewing the cart
                await cartService.SetCartAsync(cart, cancellationToken);

                return Error.Conflict(
                    "Order.PriceChanged",
                    $"Prices have changed for some items in your cart: {string.Join("; ", priceChanges)}. Your cart has been updated with the latest prices. Please review and confirm your order."
                );
            }

            // 6. Execute Order Creation within an Atomic Database Transaction
            await using var transaction = await context.BeginTransactionAsync(cancellationToken);

            try
            {
                var orderId = Guid.NewGuid();
                var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
                var subTotal = cart.Items.Sum(i => currentDishes[i.DishId].Price * i.Quantity);
                
                var shippingAddress = !string.IsNullOrWhiteSpace(command.ShippingAddress)
                    ? command.ShippingAddress.Trim()
                    : (!string.IsNullOrWhiteSpace(customer.DeliveryAddressTitle) ? customer.DeliveryAddressTitle : "عنوان التوصيل المحدد");

                decimal shippingFee = 25.00m;

                if (customer.HasDeliveryLocation && resturant.HasLocation)
                {
                    var distanceKm = GeoDistanceCalculator.CalculateDistanceKm(
                        customer.Latitude!.Value,
                        customer.Longitude!.Value,
                        resturant.Latitude!.Value,
                        resturant.Longitude!.Value
                    );

                    if (distanceKm > resturant.DeliveryRadiusKm)
                    {
                        return Error.Validation(
                            "Order.OutOfDeliveryRange",
                            $"عنوان التوصيل الخاص بك يبعد {distanceKm:F1} كم، وهو خارج نطاق التوصيل المتاح للمطعم ({resturant.DeliveryRadiusKm:F1} كم)."
                        );
                    }

                    shippingFee = GeoDistanceCalculator.CalculateDeliveryFee(distanceKm);
                }

                var orderResult = Order.Create(
                    orderId,
                    orderNumber,
                    customer.Id,
                    resturant.Id,
                    subTotal,
                    shippingFee,
                    shippingAddress,
                    command.PaymentMethod ?? "CashOnDelivery"
                );

                if (orderResult.IsError)
                {
                    return orderResult.Errors;
                }

                var order = orderResult.Value;
                context.Orders.Add(order);

                var orderItemDtos = new List<OrderItemDto>();
                var commissionRate = merchant?.CommissionRate ?? 15.0m;

                foreach (var cartItem in cart.Items)
                {
                    var dish = currentDishes[cartItem.DishId];
                    var itemResult = OrderItem.Create(
                        Guid.NewGuid(),
                        order.Id,
                        dish.Id,
                        merchant?.Id ?? Guid.Empty,
                        dish.Name,
                        dish.Price,
                        cartItem.Quantity,
                        commissionRate
                    );

                    if (itemResult.IsError)
                    {
                        await transaction.RollbackAsync(cancellationToken);
                        return itemResult.Errors;
                    }

                    var orderItem = itemResult.Value;
                    context.OrderItems.Add(orderItem);

                    orderItemDtos.Add(new OrderItemDto(
                        orderItem.Id,
                        dish.Id,
                        dish.Name,
                        dish.Price,
                        cartItem.Quantity,
                        orderItem.TotalPrice
                    ));
                }

                await context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                // 7. Clear Shopping Cart from HybridCache on Successful Order
                await cartService.ClearCartAsync(userId, cancellationToken);

                var orderDto = new OrderDto(
                    order.Id,
                    order.OrderNumber,
                    order.CustomerId,
                    order.ResturantId,
                    resturant.Name,
                    order.Status.ToString(),
                    order.PaymentStatus.ToString(),
                    order.SubTotal,
                    order.ShippingFee,
                    order.TotalAmount,
                    order.ShippingAddress,
                    order.PaymentMethod,
                    order.CreatedAt,
                    orderItemDtos,
                    CustomerName: $"{customer.FirstName} {customer.LastName}".Trim(),
                    CustomerPhone: customer.PhoneNumber,
                    DeliveryLocation: customer.HasDeliveryLocation
                        ? new DeliveryLocationDto(customer.Latitude, customer.Longitude, customer.DeliveryAddressTitle)
                        : null
                );

                // 8. Broadcast Real-time Event to the Vendor via SignalR
                if (order.ResturantId.HasValue)
                {
                    await orderNotificationService.NotifyNewOrderAsync(order.ResturantId.Value, orderDto, cancellationToken);
                }

                return orderDto;
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }
    }
}
