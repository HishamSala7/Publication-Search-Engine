using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PublicationSearchEngine.Data.Migrations
{
    /// <inheritdoc />
    public partial class OpenAlexInstitutionAndWorkTypeTablesAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "open_alex_institutions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    open_alex_id = table.Column<string>(type: "text", nullable: false),
                    display_name = table.Column<string>(type: "text", nullable: false),
                    ror = table.Column<string>(type: "text", nullable: true),
                    country_id = table.Column<Guid>(type: "uuid", nullable: true),
                    works_count = table.Column<long>(type: "bigint", nullable: false),
                    synced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_open_alex_institutions", x => x.id);
                    table.ForeignKey(
                        name: "FK_open_alex_institutions_countries_country_id",
                        column: x => x.country_id,
                        principalTable: "countries",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "work_types",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    open_alex_id = table.Column<string>(type: "text", nullable: false),
                    open_alex_display_name = table.Column<string>(type: "text", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    works_count = table.Column<long>(type: "bigint", nullable: false),
                    synced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_work_types", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_open_alex_institutions_country_id",
                table: "open_alex_institutions",
                column: "country_id");

            migrationBuilder.CreateIndex(
                name: "IX_open_alex_institutions_open_alex_id",
                table: "open_alex_institutions",
                column: "open_alex_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "open_alex_institutions");

            migrationBuilder.DropTable(
                name: "work_types");
        }
    }
}
