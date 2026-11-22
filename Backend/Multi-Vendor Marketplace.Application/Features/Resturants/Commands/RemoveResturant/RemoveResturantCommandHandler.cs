using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Resturants;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Resturants.Commands.RemoveResturant
{
    public class RemoveResturantCommandHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<RemoveResturantCommand, Result<Deleted>>
    {
        public async Task<Result<Deleted>> Handle(RemoveResturantCommand command, CancellationToken cancellationToken)
        {
            var resturant = await context.Resturants
                .FirstOrDefaultAsync(r => r.Id == command.Id, cancellationToken);

            if (resturant is null)
            {
                return ResturantError.NotFound;
            }

            // Resource-Based Data Ownership check:
            if (!currentUserService.IsAdmin && resturant.OwnerId != currentUserService.UserId)
            {
                return Error.Forbidden("Resturant.NotOwner", "You do not have permission to delete this restaurant.");
            }

            context.Resturants.Remove(resturant);
            await context.SaveChangesAsync(cancellationToken);

            return Result.Deleted;
        }
    }
}
