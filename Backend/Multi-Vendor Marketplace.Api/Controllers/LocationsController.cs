using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Multi_Vendor_Marketplace.Application.Features.Locations.Commands.SetCustomerLocation;
using Multi_Vendor_Marketplace.Application.Features.Locations.Commands.SetRestaurantLocation;
using Multi_Vendor_Marketplace.Application.Features.Locations.Queries.CheckDeliveryCoverage;
using Multi_Vendor_Marketplace.Application.Features.Locations.Queries.GetCustomerLocation;
using Multi_Vendor_Marketplace.Application.Features.Locations.Queries.GetRestaurantLocation;
using Multi_Vendor_Marketplace.Contracts.Locations;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Controllers
{
    [Route("api/locations")]
    public class LocationsController(ISender sender) : ApiController
    {
        [HttpGet("customer")]
        [Authorize]
        public async Task<IActionResult> GetCustomerLocation(CancellationToken cancellationToken)
        {
            var query = new GetCustomerLocationQuery();
            var result = await sender.Send(query, cancellationToken);

            return result.Match(
                location => Ok(location),
                errors => Problem(errors)
            );
        }

        [HttpPost("customer")]
        [Authorize]
        public async Task<IActionResult> SetCustomerLocation([FromBody] SetCustomerLocationRequest request, CancellationToken cancellationToken)
        {
            var command = new SetCustomerLocationCommand(request.Latitude, request.Longitude, request.AddressTitle);
            var result = await sender.Send(command, cancellationToken);

            return result.Match(
                location => Ok(location),
                errors => Problem(errors)
            );
        }

        [HttpGet("restaurant/{restaurantId:guid}")]
        public async Task<IActionResult> GetRestaurantLocation(Guid restaurantId, CancellationToken cancellationToken)
        {
            var query = new GetRestaurantLocationQuery(restaurantId);
            var result = await sender.Send(query, cancellationToken);

            return result.Match(
                location => Ok(location),
                errors => Problem(errors)
            );
        }

        [HttpPost("restaurant/{restaurantId:guid}")]
        [Authorize]
        public async Task<IActionResult> SetRestaurantLocation(Guid restaurantId, [FromBody] SetRestaurantLocationRequest request, CancellationToken cancellationToken)
        {
            var command = new SetRestaurantLocationCommand(
                restaurantId,
                request.Latitude,
                request.Longitude,
                request.AddressTitle,
                request.DeliveryRadiusKm
            );

            var result = await sender.Send(command, cancellationToken);

            return result.Match(
                location => Ok(location),
                errors => Problem(errors)
            );
        }

        [HttpGet("check-coverage/{restaurantId:guid}")]
        [Authorize]
        public async Task<IActionResult> CheckDeliveryCoverage(Guid restaurantId, CancellationToken cancellationToken)
        {
            var query = new CheckDeliveryCoverageQuery(restaurantId);
            var result = await sender.Send(query, cancellationToken);

            return result.Match(
                coverage => Ok(coverage),
                errors => Problem(errors)
            );
        }
    }
}
