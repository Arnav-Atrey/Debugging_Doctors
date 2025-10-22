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

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual User User { get; set; } = null!;
}
