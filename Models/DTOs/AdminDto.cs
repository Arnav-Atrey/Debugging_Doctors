namespace Hospital_Management_system.Models.DTOs
{
    public class AdminRegistrationDto
    {
        public string Email { get; set; } = null!;
        public string PswdHash { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string? Department { get; set; }
        public string? ContactNo { get; set; }
    }

    public class AdminDto
    {
        public int AdminId { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Department { get; set; }
        public string? ContactNo { get; set; }
        public bool IsApproved { get; set; }
        public string? ApprovedByName { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AdminApprovalDto
    {
        public int AdminId { get; set; }
        public int ApprovedBy { get; set; }
    }

    public class AdminUpdateDto
    {
        public int AdminId { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string? Department { get; set; }
        public string? ContactNo { get; set; }
    }

    public class AdminStatsDto
    {
        public int TotalDoctors { get; set; }
        public int TotalPatients { get; set; }
        public int TotalAppointments { get; set; }
        public int PendingAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int PendingAdmins { get; set; }
    }
}