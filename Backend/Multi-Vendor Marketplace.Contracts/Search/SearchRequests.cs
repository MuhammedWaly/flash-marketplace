namespace Multi_Vendor_Marketplace.Contracts.Search
{
    public record GlobalSearchRequest(
        string? Query = null,
        string? Category = null,
        decimal? MinPrice = null,
        decimal? MaxPrice = null,
        decimal? MinRating = null,
        bool? OnlyDeliverable = null,
        string? SortBy = "nearest",
        int PageNumber = 1,
        int PageSize = 10,
        double? UserLat = null,
        double? UserLng = null,
        double? Lat = null,
        double? Lng = null
    );
}
