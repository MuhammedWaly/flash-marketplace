using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Resturants.Dtos;
using Multi_Vendor_Marketplace.Application.Features.Resturants.Mappers;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Resturants;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Resturants.Commands.CreateResturant
{
    public class CreateResturantCommandHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<CreateResturantCommand, Result<ResturantDto>>
    {
        public async Task<Result<ResturantDto>> Handle(CreateResturantCommand command, CancellationToken cancellationToken)
        {
            var ownerId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(ownerId))
            {
                return Error.Unauthorized("Auth.Unauthorized", "You must be logged in to create a restaurant.");
            }

            var resturantResult = Resturant.Create(
                Guid.NewGuid(),
                command.Name,
                command.Description,
                command.Category,
                command.LogoUrl,
                command.CoverImageUrl,
                command.PhoneNumber,
                ownerId);

            if (resturantResult.IsError)
            {
                return resturantResult.Errors;
            }

            context.Resturants.Add(resturantResult.Value);
            await context.SaveChangesAsync(cancellationToken);

            return resturantResult.Value.ToDto();
        }
    }
}
