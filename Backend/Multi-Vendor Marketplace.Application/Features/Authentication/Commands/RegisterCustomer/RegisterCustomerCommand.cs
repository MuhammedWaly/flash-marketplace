using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.RegisterCustomer
{
    public sealed record RegisterCustomerCommand(
        string FirstName,
        string LastName,
        string Email,
        string Password,
        string PhoneNumber
    ) : IRequest<Result<AuthResponse>>;
}
