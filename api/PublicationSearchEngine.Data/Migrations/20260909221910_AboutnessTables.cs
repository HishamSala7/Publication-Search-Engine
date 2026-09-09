using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PublicationSearchEngine.Data.Migrations
{
    /// <inheritdoc />
    public partial class AboutnessTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "countries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    open_alex_id = table.Column<string>(type: "text", nullable: false),
                    display_name = table.Column<string>(type: "text", nullable: false),
                    country_code_alpha_two = table.Column<string>(type: "text", nullable: true),
                    country_code_alpha_three = table.Column<string>(type: "text", nullable: true),
                    continent = table.Column<string>(type: "text", nullable: false),
                    works_count = table.Column<long>(type: "bigint", nullable: false),
                    synced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_countries", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "fields",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    open_alex_id = table.Column<string>(type: "text", nullable: false),
                    display_name = table.Column<string>(type: "text", nullable: false),
                    works_count = table.Column<long>(type: "bigint", nullable: false),
                    synced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fields", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "sub_fields",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    open_alex_id = table.Column<string>(type: "text", nullable: false),
                    field_id = table.Column<Guid>(type: "uuid", nullable: false),
                    display_name = table.Column<string>(type: "text", nullable: false),
                    works_count = table.Column<long>(type: "bigint", nullable: false),
                    synced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sub_fields", x => x.id);
                    table.ForeignKey(
                        name: "FK_sub_fields_fields_field_id",
                        column: x => x.field_id,
                        principalTable: "fields",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "topics",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    open_alex_id = table.Column<string>(type: "text", nullable: false),
                    sub_field_id = table.Column<Guid>(type: "uuid", nullable: false),
                    display_name = table.Column<string>(type: "text", nullable: false),
                    works_count = table.Column<long>(type: "bigint", nullable: false),
                    synced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FieldId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_topics", x => x.id);
                    table.ForeignKey(
                        name: "FK_topics_fields_FieldId",
                        column: x => x.FieldId,
                        principalTable: "fields",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_topics_sub_fields_sub_field_id",
                        column: x => x.sub_field_id,
                        principalTable: "sub_fields",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "keywords",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    open_alex_id = table.Column<string>(type: "text", nullable: false),
                    topic_id = table.Column<Guid>(type: "uuid", nullable: false),
                    display_name = table.Column<string>(type: "text", nullable: false),
                    works_count = table.Column<long>(type: "bigint", nullable: false),
                    synced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_keywords", x => x.id);
                    table.ForeignKey(
                        name: "FK_keywords_topics_topic_id",
                        column: x => x.topic_id,
                        principalTable: "topics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_countries_open_alex_id",
                table: "countries",
                column: "open_alex_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_fields_open_alex_id",
                table: "fields",
                column: "open_alex_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_keywords_open_alex_id",
                table: "keywords",
                column: "open_alex_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_keywords_topic_id",
                table: "keywords",
                column: "topic_id");

            migrationBuilder.CreateIndex(
                name: "IX_sub_fields_field_id",
                table: "sub_fields",
                column: "field_id");

            migrationBuilder.CreateIndex(
                name: "IX_sub_fields_open_alex_id",
                table: "sub_fields",
                column: "open_alex_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_topics_FieldId",
                table: "topics",
                column: "FieldId");

            migrationBuilder.CreateIndex(
                name: "IX_topics_open_alex_id",
                table: "topics",
                column: "open_alex_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_topics_sub_field_id",
                table: "topics",
                column: "sub_field_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "countries");

            migrationBuilder.DropTable(
                name: "keywords");

            migrationBuilder.DropTable(
                name: "topics");

            migrationBuilder.DropTable(
                name: "sub_fields");

            migrationBuilder.DropTable(
                name: "fields");
        }
    }
}
