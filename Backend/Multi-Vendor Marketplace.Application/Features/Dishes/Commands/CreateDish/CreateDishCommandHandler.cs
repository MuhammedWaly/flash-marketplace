using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Dtos;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Mappers;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Dishes;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Dishes.Commands.CreateDish
{
    public class CreateDishCommandHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<CreateDishCommand, Result<DishDto>>
    {
        public async Task<Result<DishDto>> Handle(CreateDishCommand command, CancellationToken cancellationToken)
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
                return Error.Forbidden("Dish.NotOwner", "You do not have permission to add dishes to this restaurant.");
            }

            var dishResult = Dish.Create(
                Guid.NewGuid(),
                command.Name,
                command.Description,
                command.Price,
                command.ResturantId,
                command.ImageUrl);

            if (dishResult.IsError)
            {
                return dishResult.Errors;
            }

            context.Dishes.Add(dishResult.Value);
            await context.SaveChangesAsync(cancellationToken);

            return dishResult.Value.ToDto();
        }
    }
}
