using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PublicationSearchEngine.Data.Migrations
{
    /// <inheritdoc />
    public partial class TopicKeywordTableAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_keywords_topics_topic_id",
                table: "keywords");

            migrationBuilder.DropIndex(
                name: "IX_keywords_topic_id",
                table: "keywords");

            migrationBuilder.DropColumn(
                name: "topic_id",
                table: "keywords");

            migrationBuilder.AlterColumn<Guid>(
                name: "sub_field_id",
                table: "topics",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "field_id",
                table: "sub_fields",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.CreateTable(
                name: "topic_keywords",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    topic_id = table.Column<Guid>(type: "uuid", nullable: false),
                    keyword_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_topic_keywords", x => x.id);
                    table.ForeignKey(
                        name: "FK_topic_keywords_keywords_keyword_id",
                        column: x => x.keyword_id,
                        principalTable: "keywords",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_topic_keywords_topics_topic_id",
                        column: x => x.topic_id,
                        principalTable: "topics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_topic_keywords_keyword_id",
                table: "topic_keywords",
                column: "keyword_id");

            migrationBuilder.CreateIndex(
                name: "IX_topic_keywords_topic_id_keyword_id",
                table: "topic_keywords",
                columns: new[] { "topic_id", "keyword_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "topic_keywords");

            migrationBuilder.AlterColumn<Guid>(
                name: "sub_field_id",
                table: "topics",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "field_id",
                table: "sub_fields",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "topic_id",
                table: "keywords",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_keywords_topic_id",
                table: "keywords",
                column: "topic_id");

            migrationBuilder.AddForeignKey(
                name: "FK_keywords_topics_topic_id",
                table: "keywords",
                column: "topic_id",
                principalTable: "topics",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
