using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Multi_Vendor_Marketplace.Application.Features.Vendor.Commands.StripeOnboarding;
using Multi_Vendor_Marketplace.Application.Features.Vendor.Queries.GetStripeStatus;
using Multi_Vendor_Marketplace.Domain.Common;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Controllers
{
    [Route("api/vendor/stripe")]
    [Authorize]
    public class VendorStripeController(IMediator mediator) : ApiController
    {
        [HttpPost("onboard")]
        public async Task<IActionResult> CreateOnboardingLink()
        {
            var command = new CreateStripeOnboardingLinkCommand();
            var result = await mediator.Send(command);

            return result.Match(
                response => Ok(response),
                Problem
            );
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStripeStatus()
        {
            var query = new GetSellerStripeStatusQuery();
            var result = await mediator.Send(query);

            return result.Match(
                response => Ok(response),
                Problem
            );
        }
    }
}
