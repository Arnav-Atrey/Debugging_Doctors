using System;
using System.Collections.Generic;

namespace Hospital_Management_system.Models;

public partial class Doctor
{
    public int DocId { get; set; }

    public int UserId { get; set; }

    public string FullName { get; set; } = null!;

    public string? Specialisation { get; set; }

    public string? HPID { get; set; }

    public string? Availability { get; set; }

    public string? ContactNo { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual User User { get; set; } = null!;
}
