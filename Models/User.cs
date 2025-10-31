using System;
using System.Collections.Generic;

namespace Hospital_Management_system.Models;

<<<<<<< HEAD
public partial class User : ISoftDeletable
=======
public partial class User
>>>>>>> origin/bycts9
{
    public int UserId { get; set; }

    public string Email { get; set; } = null!;

    public string PswdHash { get; set; } = null!;

    public string Role { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();

<<<<<<< HEAD
    public virtual ICollection<Patient> Patients { get; set; } = new List<Patient>();

    // Soft Delete properties
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public int? DeletedBy { get; set; }
=======
    public virtual ICollection<Patient> Patients { get; set; } = new List<Patient>();
>>>>>>> origin/bycts9
}
