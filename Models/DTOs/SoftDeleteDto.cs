namespace Hospital_Management_system.Models.DTOs
{
    public class SoftDeleteDto
    {
        public int DeletedBy { get; set; }
        public string? Reason { get; set; }
    }

    public class RestoreDto
    {
        public int RestoredBy { get; set; }
    }
}