// Models/Medicine.cs
using System.ComponentModel.DataAnnotations;

namespace Hospital_Management_system.Models
{
    public class Medicine
    {
        [Key]
        public int MedicineID { get; set; }

        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Specialization { get; set; } = null!; // General, Cardiology, Psychiatry

        [Required]
        public decimal PricePerTablet { get; set; }

        public string? GenericName { get; set; }
    }
}