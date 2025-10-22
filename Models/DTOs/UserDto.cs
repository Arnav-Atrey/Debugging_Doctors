using System.ComponentModel.DataAnnotations;

namespace Hospital_Management_system.Models.DTOs
{
    public class UserDto
    {
        public int UserId { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Role { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
