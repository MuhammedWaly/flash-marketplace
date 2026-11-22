using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Multi_Vendor_Marketplace.Infrastructures.Migrations
{
    /// <inheritdoc />
    public partial class AddRestaurantOperatingSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsOpen",
                table: "Resturants",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MinOrderValue",
                table: "Resturants",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0.0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsOpen",
                table: "Resturants");

            migrationBuilder.DropColumn(
                name: "MinOrderValue",
                table: "Resturants");
        }
    }
}
