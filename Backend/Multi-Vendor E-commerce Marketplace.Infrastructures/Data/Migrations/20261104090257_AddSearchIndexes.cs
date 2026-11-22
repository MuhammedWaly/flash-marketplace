using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Multi_Vendor_Marketplace.Infrastructures.Migrations
{
    /// <inheritdoc />
    public partial class AddSearchIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Resturants_category",
                table: "Resturants",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "IX_Resturants_Name",
                table: "Resturants",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Dishes_Name",
                table: "Dishes",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Dishes_Price",
                table: "Dishes",
                column: "Price");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Resturants_category",
                table: "Resturants");

            migrationBuilder.DropIndex(
                name: "IX_Resturants_Name",
                table: "Resturants");

            migrationBuilder.DropIndex(
                name: "IX_Dishes_Name",
                table: "Dishes");

            migrationBuilder.DropIndex(
                name: "IX_Dishes_Price",
                table: "Dishes");
        }
    }
}
