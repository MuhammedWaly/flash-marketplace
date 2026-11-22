using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Vendor.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Vendor.Commands.UpdateVendorSettings
{
    public record UpdateVendorSettingsCommand(
        bool IsOpen,
        decimal MinOrderValue,
        double? DeliveryRadiusKm,
        double? Latitude,
        double? Longitude,
        string? AddressTitle,
        string? LogoUrl = null,
        string? CoverImageUrl = null,
        string? Name = null
    ) : IRequest<Result<VendorSettingsDto>>;
}
