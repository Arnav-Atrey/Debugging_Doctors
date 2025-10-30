using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
        [Column(TypeName = "decimal(10,2)")]
        public decimal PricePerTablet { get; set; }

        public string? GenericName { get; set; }
    }
}
