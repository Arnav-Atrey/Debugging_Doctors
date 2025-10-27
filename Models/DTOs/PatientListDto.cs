namespace Hospital_Management_system.Models.DTOs
{
    public class PatientListDto
    {
        public int PatientId { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public DateOnly? Dob { get; set; }
        public int Age { get; set; }
        public string? Gender { get; set; }
        public string? ContactNo { get; set; }
        public string? Address { get; set; }
        public string? Aadhaar_no { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}