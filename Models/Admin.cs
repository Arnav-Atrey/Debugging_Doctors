using System.ComponentModel.DataAnnotations.Schema;

namespace Hospital_Management_system.Models
{
    public partial class Admin
    {
        public int AdminId { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string? Department { get; set; }
        public string? ContactNo { get; set; }
        public bool IsApproved { get; set; }
        public int? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }

        public virtual User User { get; set; } = null!;

        // Fix the navigation property with proper foreign key attribute
        [ForeignKey("ApprovedBy")]
        public virtual Admin? ApprovedByAdmin { get; set; }

        // Add inverse navigation property
        public virtual ICollection<Admin>? ApprovedAdmins { get; set; }
    }
}