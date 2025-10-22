namespace Hospital_Management_system.Models.DTOs
{
    public class DoctorDto
    {
        public int DocId { get; set; }
        public string FullName { get; set; }
        public string Specialisation { get; set; }
        public string HPID { get; set; }
        public string Availability { get; set; }
        public string ContactNo { get; set; }
    }

    public class DoctorUpdateDto
    {
        public int DocId { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string? Specialisation { get; set; }
        public string? HPID { get; set; }
        public string? Availability { get; set; }
        public string? ContactNo { get; set; }
    }
}
