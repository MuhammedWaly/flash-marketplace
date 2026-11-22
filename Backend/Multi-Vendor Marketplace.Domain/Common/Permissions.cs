namespace Multi_Vendor_Marketplace.Domain.Common
{
    public static class Roles
    {
        public const string Admin = "Admin";
        public const string ResturantOwner = "ResturantOwner";
        public const string Customer = "Customer";
    }

    public static class Permissions
    {
        public static class Resturants
        {
            public const string Read = "resturants.read";
            public const string Create = "resturants.create";
            public const string Update = "resturants.update";
            public const string Delete = "resturants.delete";
        }

        public static class Dishes
        {
            public const string Read = "dishes.read";
            public const string Create = "dishes.create";
            public const string Update = "dishes.update";
            public const string Delete = "dishes.delete";
        }

        public static class Orders
        {
            public const string Read = "orders.read";
            public const string ReadOwn = "orders.read_own";
            public const string Create = "orders.create";
            public const string UpdateStatus = "orders.update_status";
            public const string Cancel = "orders.cancel";
        }

        public static class Reviews
        {
            public const string Create = "reviews.create";
            public const string Delete = "reviews.delete";
        }
    }
}
