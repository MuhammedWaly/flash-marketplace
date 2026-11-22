using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Resturants;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Resturants.Commands.UpdateResturant
{
    public class UpdateResturantCommandHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<UpdateResturantCommand, Result<Updated>>
    {
        public async Task<Result<Updated>> Handle(UpdateResturantCommand command, CancellationToken cancellationToken)
        {
            var resturant = await context.Resturants
                .FirstOrDefaultAsync(r => r.Id == command.Id, cancellationToken);

            if (resturant is null)
            {
                return ResturantError.NotFound;
            }

            // Resource-Based Data Ownership check:
            // Must be Admin OR the restaurant owner
            if (!currentUserService.IsAdmin && resturant.OwnerId != currentUserService.UserId)
            {
                return Error.Forbidden("Resturant.NotOwner", "You do not have permission to modify this restaurant.");
            }

            var updateResult = resturant.Update(
                command.Name,
                command.Description,
                command.Category,
                command.LogoUrl,
                command.CoverImageUrl,
                command.PhoneNumber);

            if (updateResult.IsError)
            {
                return updateResult.Errors;
            }

            await context.SaveChangesAsync(cancellationToken);

            return Result.Updated;
        }
    }
}
