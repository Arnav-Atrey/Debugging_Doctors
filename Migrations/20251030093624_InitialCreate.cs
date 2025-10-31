using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hospital_Management_system.Migrations
{
    /// <summary>
    /// Fake initial migration to sync EF with existing manual DB
    /// </summary>
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // DO NOT CREATE ANY TABLES — THEY ALREADY EXIST IN DB!
            // Just mark this migration as applied in EF history

            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT * FROM [__EFMigrationsHistory] 
                    WHERE MigrationId = '20251030123456_InitialCreate'
                )
                BEGIN
                    INSERT INTO [__EFMigrationsHistory] (MigrationId, ProductVersion)
                    VALUES ('20251030123456_InitialCreate', '8.0.0');
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove migration record on rollback
            migrationBuilder.Sql(@"
                DELETE FROM [__EFMigrationsHistory] 
                WHERE MigrationId = '20251030123456_InitialCreate';
            ");
        }
    }
}