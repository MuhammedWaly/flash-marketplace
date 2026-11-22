using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Brand
{
    public static class BrandError
    {
        public static Error NotFound =>
            Error.NotFound("Brand_Not_Found", "Brand was not found");

        public static Error NameRequired =>
            Error.Validation("Brand_Name_Required", "Brand name is required");

        public static Error SlugRequired =>
            Error.Validation("Brand_Slug_Required", "Brand slug is required");

        public static Error HasProducts =>
            Error.Conflict("Brand_Has_Products", "Cannot delete brand with associated products");
    }
}
