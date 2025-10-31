using System;
using System.Collections.Generic;

namespace Hospital_Management_system.Models;

public partial class Patient
{
    public int PatientId { get; set; }

    public int UserId { get; set; }

    public string FullName { get; set; } = null!;

    public DateOnly? Dob { get; set; }

    public string? Gender { get; set; }

    public string? ContactNo { get; set; }

    public string? Address { get; set; }

    public string? Aadhaar_no { get; set; }

<<<<<<< HEAD
    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    // Soft Delete properties
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public int? DeletedBy { get; set; }
=======
    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
>>>>>>> origin/bycts9

    public virtual User User { get; set; } = null!;
}
