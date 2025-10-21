namespace Hospital_Management_system.Models.DTOs
{
    public class PatientDetailsDto
    {
        public int PatientId { get; set; }
        public string FullName { get; set; } = null!;
        public string? Aadhaar_no { get; set; }
        public string? ContactNo { get; set; }
        public DateOnly? Dob { get; set; }  // ✅ Nullable now
        public string? Gender { get; set; } // ✅ Newly added
        public string? Address { get; set; } // ✅ Newly added

        // Optional fields if you're using this DTO elsewhere
        public int Age { get; set; }
        public int AppointmentId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string? Symptoms { get; set; }
    }
}
