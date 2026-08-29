using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PublicationSearchEngine.Data.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "institutions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    country = table.Column<string>(type: "text", nullable: true),
                    alpha_two_code = table.Column<string>(type: "text", nullable: true),
                    ror_id = table.Column<string>(type: "text", nullable: true),
                    resolution_method = table.Column<string>(type: "text", nullable: true),
                    ror_lookup_attempted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    synced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_institutions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "institution_domains",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    domain = table.Column<string>(type: "text", nullable: false),
                    institution_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_institution_domains", x => x.id);
                    table.ForeignKey(
                        name: "FK_institution_domains_institutions_institution_id",
                        column: x => x.institution_id,
                        principalTable: "institutions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_institution_domains_domain",
                table: "institution_domains",
                column: "domain",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_institution_domains_institution_id",
                table: "institution_domains",
                column: "institution_id");

            migrationBuilder.CreateIndex(
                name: "IX_institutions_ror_id",
                table: "institutions",
                column: "ror_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "institution_domains");

            migrationBuilder.DropTable(
                name: "institutions");
        }
    }
}
