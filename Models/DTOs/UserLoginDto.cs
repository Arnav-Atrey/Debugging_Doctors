using System.ComponentModel.DataAnnotations;

namespace Hospital_Management_system.Models.DTOs
{
    public class UserLoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PswdHash { get; set; }
    }

    public class LoginResponseDto
    {
        public int UserId { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public int? PatientId { get; set; }
        public int? DoctorId { get; set; }
        public string? FullName { get; set; }
    }
}
