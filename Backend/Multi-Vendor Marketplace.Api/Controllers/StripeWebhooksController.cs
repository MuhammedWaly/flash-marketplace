using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Multi_Vendor_Marketplace.Application.Features.Payments.Commands.ProcessWebhook;
using System.IO;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Controllers
{
    [Route("api/payments/webhook")]
    [ApiController]
    [AllowAnonymous]
    public class StripeWebhooksController(IMediator mediator) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> HandleWebhook()
        {
            var signatureHeader = Request.Headers["Stripe-Signature"].ToString();
            if (string.IsNullOrWhiteSpace(signatureHeader))
            {
                return BadRequest("Missing Stripe-Signature header.");
            }

            string rawBody;
            using (var reader = new StreamReader(Request.Body))
            {
                rawBody = await reader.ReadToEndAsync();
            }

            if (string.IsNullOrWhiteSpace(rawBody))
            {
                return BadRequest("Empty request body.");
            }

            var command = new ProcessStripeWebhookCommand(rawBody, signatureHeader);
            var result = await mediator.Send(command);

            if (result.IsError)
            {
                return BadRequest(new { errors = result.Errors });
            }

            return Ok();
        }
    }
}
