using System;
using System.Collections.Generic;

namespace Hospital_Management_system.Models;

<<<<<<< HEAD
public partial class Doctor : ISoftDeletable
=======
public partial class Doctor
>>>>>>> origin/bycts9
{
    public int DocId { get; set; }

    public int UserId { get; set; }

    public string FullName { get; set; } = null!;

    public string? Specialisation { get; set; }

    public string? HPID { get; set; }

    public string? Availability { get; set; }

    public string? ContactNo { get; set; }

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
