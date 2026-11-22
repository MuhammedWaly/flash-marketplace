using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Common.Utilities;
using Multi_Vendor_Marketplace.Application.Features.Locations.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Locations.Queries.CheckDeliveryCoverage
{
    public class CheckDeliveryCoverageQueryHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<CheckDeliveryCoverageQuery, Result<DeliveryCoverageDto>>
    {
        public async Task<Result<DeliveryCoverageDto>> Handle(CheckDeliveryCoverageQuery request, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            var customer = await context.Customers
                .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

            if (customer is null)
            {
                return Error.NotFound("Customer.NotFound", "Customer profile was not found.");
            }

            var restaurant = await context.Resturants
                .FirstOrDefaultAsync(r => r.Id == request.RestaurantId, cancellationToken);

            if (restaurant is null)
            {
                return Error.NotFound("Resturant.NotFound", "The restaurant was not found.");
            }

            if (!customer.HasDeliveryLocation)
            {
                return new DeliveryCoverageDto(
                    CanDeliver: false,
                    RequiresCustomerLocation: true,
                    RequiresRestaurantLocation: false,
                    DistanceKm: null,
                    DeliveryRadiusKm: restaurant.DeliveryRadiusKm,
                    EstimatedDeliveryFee: null,
                    CustomerAddressTitle: null,
                    RestaurantAddressTitle: restaurant.AddressTitle,
                    Message: "يرجى تحديد موقعك على الخريطة أولاً لتأكيد إمكانية التوصيل."
                );
            }

            if (!restaurant.HasLocation)
            {
                return new DeliveryCoverageDto(
                    CanDeliver: false,
                    RequiresCustomerLocation: false,
                    RequiresRestaurantLocation: true,
                    DistanceKm: null,
                    DeliveryRadiusKm: restaurant.DeliveryRadiusKm,
                    EstimatedDeliveryFee: null,
                    CustomerAddressTitle: customer.DeliveryAddressTitle,
                    RestaurantAddressTitle: null,
                    Message: "المطعم لم يقم بتحديد موقعه الجغرافي على الخريطة بعد."
                );
            }

            var distance = GeoDistanceCalculator.CalculateDistanceKm(
                customer.Latitude!.Value,
                customer.Longitude!.Value,
                restaurant.Latitude!.Value,
                restaurant.Longitude!.Value
            );

            var canDeliver = distance <= restaurant.DeliveryRadiusKm;
            var estimatedFee = GeoDistanceCalculator.CalculateDeliveryFee(distance);

            var message = canDeliver
                ? $"موقعك يقع ضمن نطاق التوصيل المتاح للمطعم (المسافة: {distance:F1} كم). تكلفة التوصيل التقديرية: {estimatedFee:F2} ج.م."
                : $"موقعك خارج نطاق التوصيل المتاح لهذا المطعم (المسافة: {distance:F1} كم، بينما أقصى نطاق للتوصيل هو {restaurant.DeliveryRadiusKm:F1} كم).";

            return new DeliveryCoverageDto(
                CanDeliver: canDeliver,
                RequiresCustomerLocation: false,
                RequiresRestaurantLocation: false,
                DistanceKm: distance,
                DeliveryRadiusKm: restaurant.DeliveryRadiusKm,
                EstimatedDeliveryFee: estimatedFee,
                CustomerAddressTitle: customer.DeliveryAddressTitle,
                RestaurantAddressTitle: restaurant.AddressTitle,
                Message: message
            );
        }
    }
}
