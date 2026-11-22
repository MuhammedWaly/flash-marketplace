using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Multi_Vendor_Marketplace.Api.Extensions;
using Multi_Vendor_Marketplace.Application.Features.Payments.Commands.CreateCheckoutSession;
using Multi_Vendor_Marketplace.Application.Features.Payments.Queries.GetPaymentStatus;
using Multi_Vendor_Marketplace.Contracts.Payments;
using System;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController(IMediator mediator) : ApiController
    {
        [HttpPost("checkout-session")]
        [EnableRateLimiting(RateLimiterExtensions.CheckoutPolicy)]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateCheckoutSessionRequest request)
        {
            var command = new CreateCheckoutSessionCommand(request.OrderId);
            var result = await mediator.Send(command);

            return result.Match(
                response => Ok(response),
                Problem
            );
        }

        [HttpGet("order/{orderId:guid}")]
        public async Task<IActionResult> GetPaymentStatus(Guid orderId)
        {
            var query = new GetPaymentStatusQuery(orderId);
            var result = await mediator.Send(query);

            return result.Match(
                response => Ok(response),
                Problem
            );
        }
    }
}
