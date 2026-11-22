using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Multi_Vendor_Marketplace.Infrastructures.Migrations
{
    /// <inheritdoc />
    public partial class AddPinLocationsAndDistance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AddressTitle",
                table: "Resturants",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "DeliveryRadiusKm",
                table: "Resturants",
                type: "float",
                nullable: false,
                defaultValue: 10.0);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Resturants",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Resturants",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryAddressTitle",
                table: "Customers",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Customers",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Customers",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddressTitle",
                table: "Resturants");

            migrationBuilder.DropColumn(
                name: "DeliveryRadiusKm",
                table: "Resturants");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Resturants");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Resturants");

            migrationBuilder.DropColumn(
                name: "DeliveryAddressTitle",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Customers");
        }
    }
}
