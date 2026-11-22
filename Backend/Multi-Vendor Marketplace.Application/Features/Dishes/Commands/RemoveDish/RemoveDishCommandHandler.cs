using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Dishes;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Dishes.Commands.RemoveDish
{
    public class RemoveDishCommandHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<RemoveDishCommand, Result<Deleted>>
    {
        public async Task<Result<Deleted>> Handle(RemoveDishCommand command, CancellationToken cancellationToken)
        {
            var resturant = await context.Resturants
                .FirstOrDefaultAsync(r => r.Id == command.ResturantId, cancellationToken);

            if (resturant is null)
            {
                return DishError.ResturantNotFound;
            }

            // Resource-Based Data Ownership check: Admin or Restaurant Owner
            if (!currentUserService.IsAdmin && resturant.OwnerId != currentUserService.UserId)
            {
                return Error.Forbidden("Dish.NotOwner", "You do not have permission to delete dishes from this restaurant.");
            }

            var dish = await context.Dishes
                .FirstOrDefaultAsync(d => d.Id == command.DishId && d.ResturantId == command.ResturantId, cancellationToken);

            if (dish is null)
            {
                return DishError.NotFound;
            }

            context.Dishes.Remove(dish);
            await context.SaveChangesAsync(cancellationToken);

            return Result.Deleted;
        }
    }
}
