using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hospital_Management_system.Migrations
{
    public partial class AddMedicinesTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Medicines",
                columns: table => new
                {
                    MedicineID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Specialization = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PricePerTablet = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    GenericName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medicines", x => x.MedicineID);
                });

            migrationBuilder.InsertData(
                table: "Medicines",
                columns: new[] { "MedicineID", "Name", "Specialization", "PricePerTablet", "GenericName" },
                values: new object[,]
                {
                    { 1, "Paracetamol 500mg", "General", 2.00m, null },
                    { 2, "Amoxicillin 500mg", "General", 10.00m, null },
                    { 3, "Cetirizine 10mg", "General", 3.50m, null },
                    { 4, "Metformin 500mg", "General", 4.00m, null },
                    { 5, "Amlodipine 5mg", "Cardiology", 5.00m, null },
                    { 6, "Atorvastatin 20mg", "Cardiology", 8.00m, null },
                    { 7, "Clopidogrel 75mg", "Cardiology", 12.00m, null },
                    { 8, "Sertraline 50mg", "Psychiatry", 15.00m, null },
                    { 9, "Escitalopram 10mg", "Psychiatry", 18.00m, null },
                    { 10, "Alprazolam 0.5mg", "Psychiatry", 7.00m, null }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Medicines");
        }
    }
}