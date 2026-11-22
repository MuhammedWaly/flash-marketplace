namespace Multi_Vendor_Marketplace.Application.Features.Authentication.Dtos
{
    public record AuthResponse(
        string Id,
        string Email,
        string UserName,
        string AccessToken,
        string RefreshToken,
        int ExpiresIn
    );
}
