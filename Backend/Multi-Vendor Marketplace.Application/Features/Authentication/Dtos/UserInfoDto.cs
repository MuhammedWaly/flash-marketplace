using System.Collections.Generic;

namespace Multi_Vendor_Marketplace.Application.Features.Authentication.Dtos
{
    public record UserInfoDto(
        string Id,
        string Email,
        string UserName,
        string? PhoneNumber,
        List<string> Roles
    );
}
