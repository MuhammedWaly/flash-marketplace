using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Category
{
    public static class CategoryError
    {
        public static Error NotFound =>
            Error.NotFound("Category_Not_Found", "Category was not found");

        public static Error NameRequired =>
            Error.Validation("Category_Name_Required", "Category name is required");

        public static Error SlugRequired =>
            Error.Validation("Category_Slug_Required", "Category slug is required");

        public static Error HasSubCategories =>
            Error.Conflict("Category_Has_SubCategories", "Cannot delete category that has subcategories");

        public static Error HasProducts =>
            Error.Conflict("Category_Has_Products", "Cannot delete category with associated products");
    }
}
