using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Multi_Vendor_Marketplace.Application.Features.Admin.Finance.Commands.RecordPayout;
using Multi_Vendor_Marketplace.Application.Features.Admin.Finance.Commands.UpdateCommissionRate;
using Multi_Vendor_Marketplace.Application.Features.Admin.Finance.Queries.GetFinanceOverview;
using Multi_Vendor_Marketplace.Application.Features.Admin.Finance.Queries.GetMerchantFinances;
using Multi_Vendor_Marketplace.Application.Features.Admin.Merchants.Commands.ApproveMerchant;
using Multi_Vendor_Marketplace.Application.Features.Admin.Merchants.Commands.RejectMerchant;
using Multi_Vendor_Marketplace.Application.Features.Admin.Merchants.Commands.ToggleMerchantStatus;
using Multi_Vendor_Marketplace.Application.Features.Admin.Merchants.Queries.GetAdminMerchants;
using Multi_Vendor_Marketplace.Domain.Common;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Controllers
{
    [Route("api/admin")]
    [Authorize(Roles = Roles.Admin)]
    public class AdminController(ISender sender) : ApiController
    {
        // -----------------------------------------------------------------
        // Feature 1: Vendor Approvals & KYC
        // -----------------------------------------------------------------

        [HttpGet("merchants")]
        public async Task<IActionResult> GetMerchants(
            [FromQuery] string? status = null,
            [FromQuery] string? search = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            var query = new GetAdminMerchantsQuery(status, search, pageNumber, pageSize);
            var result = await sender.Send(query, cancellationToken);

            return result.Match(
                paged => Ok(paged),
                Problem
            );
        }

        [HttpPut("merchants/{id:guid}/approve")]
        public async Task<IActionResult> ApproveMerchant(Guid id, CancellationToken cancellationToken)
        {
            var command = new ApproveMerchantCommand(id);
            var result = await sender.Send(command, cancellationToken);

            return result.Match(
                _ => Ok(new { message = "Merchant approved successfully." }),
                Problem
            );
        }

        public record RejectMerchantRequest(string? Reason);

        [HttpPut("merchants/{id:guid}/reject")]
        public async Task<IActionResult> RejectMerchant(
            Guid id,
            [FromBody] RejectMerchantRequest? request,
            CancellationToken cancellationToken)
        {
            var command = new RejectMerchantCommand(id, request?.Reason);
            var result = await sender.Send(command, cancellationToken);

            return result.Match(
                _ => Ok(new { message = "Merchant rejected." }),
                Problem
            );
        }

        [HttpPut("merchants/{id:guid}/toggle-status")]
        public async Task<IActionResult> ToggleMerchantStatus(Guid id, CancellationToken cancellationToken)
        {
            var command = new ToggleMerchantStatusCommand(id);
            var result = await sender.Send(command, cancellationToken);

            return result.Match(
                _ => Ok(new { message = "Merchant active status toggled." }),
                Problem
            );
        }

        // -----------------------------------------------------------------
        // Feature 2: Platform Commission & Payouts
        // -----------------------------------------------------------------

        [HttpGet("finance/overview")]
        public async Task<IActionResult> GetFinanceOverview(CancellationToken cancellationToken)
        {
            var query = new GetFinanceOverviewQuery();
            var result = await sender.Send(query, cancellationToken);

            return result.Match(
                overview => Ok(overview),
                Problem
            );
        }

        [HttpGet("finance/merchants")]
        public async Task<IActionResult> GetMerchantFinances(
            [FromQuery] string? search = null,
            CancellationToken cancellationToken = default)
        {
            var query = new GetMerchantFinancesQuery(search);
            var result = await sender.Send(query, cancellationToken);

            return result.Match(
                list => Ok(list),
                Problem
            );
        }

        public record UpdateCommissionRequest(decimal CommissionRate);

        [HttpPut("merchants/{id:guid}/commission")]
        public async Task<IActionResult> UpdateCommission(
            Guid id,
            [FromBody] UpdateCommissionRequest request,
            CancellationToken cancellationToken)
        {
            var command = new UpdateCommissionRateCommand(id, request.CommissionRate);
            var result = await sender.Send(command, cancellationToken);

            return result.Match(
                _ => Ok(new { message = "Commission rate updated successfully." }),
                Problem
            );
        }

        public record RecordPayoutRequest(
            Guid MerchantId,
            decimal Amount,
            string Method,
            string? ReferenceNumber = null,
            string? Notes = null
        );

        [HttpPost("finance/payout")]
        public async Task<IActionResult> RecordPayout(
            [FromBody] RecordPayoutRequest request,
            CancellationToken cancellationToken)
        {
            var command = new RecordPayoutCommand(
                request.MerchantId,
                request.Amount,
                request.Method,
                request.ReferenceNumber,
                request.Notes
            );

            var result = await sender.Send(command, cancellationToken);

            return result.Match(
                payoutResult => Ok(payoutResult),
                Problem
            );
        }
    }
}
