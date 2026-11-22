namespace Multi_Vendor_Marketplace.Infrastructures.Authentication
{
    public class JwtOptions
    {
        public const string SectionName = "Jwt";

        public string SecretKey { get; init; } = default!;
        public string Issuer { get; init; } = default!;
        public string Audience { get; init; } = default!;
        public int ExpirationInMinutes { get; init; } = 60;
    }
}
