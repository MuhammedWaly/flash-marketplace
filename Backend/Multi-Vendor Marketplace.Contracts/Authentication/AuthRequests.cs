namespace Multi_Vendor_Marketplace.Contracts.Authentication
{
    public record RegisterCustomerRequest(
        string FirstName,
        string LastName,
        string Email,
        string Password,
        string PhoneNumber
    );

    public record RegisterRestaurantOwnerRequest(
        string OwnerName,
        string RestaurantName,
        string Category,
        string Description,
        string Email,
        string Password,
        string PhoneNumber,
        string? LogoUrl = null,
        string? CoverImageUrl = null
    );

    public record RegisterRequest(
        string UserName,
        string Email,
        string Password,
        string? PhoneNumber = null
    );

    public record LoginRequest(
        string Email,
        string Password
    );

    public record RefreshTokenRequest(
        string RefreshToken
    );

    public record LogoutRequest(
        string? RefreshToken = null
    );
}
