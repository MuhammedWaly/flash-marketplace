using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Application.Features.Dishes.Quries.GetDishesForResturant
{
    public sealed record GetDishesForResturantQuery(Guid ResturantId) : IRequest<Result<List<DishDto>>>;
}
