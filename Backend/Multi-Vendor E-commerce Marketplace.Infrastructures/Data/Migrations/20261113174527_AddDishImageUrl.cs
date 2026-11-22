using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Multi_Vendor_Marketplace.Infrastructures.Migrations
{
    /// <inheritdoc />
    public partial class AddDishImageUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Dishes",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Dishes");
        }
    }
}
