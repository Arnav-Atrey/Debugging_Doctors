<<<<<<< HEAD
﻿using System;
using System.Collections.Generic;

namespace Hospital_Management_system.Models;
=======
﻿using Hospital_Management_system.Models;
>>>>>>> origin/bycts9

public partial class Appointment
{
    public int AppointmentId { get; set; }
<<<<<<< HEAD

    public int PatientId { get; set; }

    public int DoctorId { get; set; }

    public string AppointmentStatus { get; set; } = null!;

    public DateTime AppointmentDate { get; set; }

    public string? Symptoms { get; set; }

    public string? Diagnosis { get; set; }

    public string? Medicines { get; set; }

    public string InvoiceStatus { get; set; } = null!;

    public decimal? InvoiceAmount { get; set; }
    // Soft Delete properties
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public int? DeletedBy { get; set; }

    public virtual Doctor Doctor { get; set; } = null!;

    public virtual Patient Patient { get; set; } = null!;

    // Existing Appointment class...
    public virtual Prescription Prescription { get; set; }  // 1:1 relationship (optional: use ICollection<Prescription> for 1:M)s
}
=======
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public string AppointmentStatus { get; set; } = null!;
    public DateTime AppointmentDate { get; set; }
    public string? Symptoms { get; set; }
    public string? Diagnosis { get; set; }
    public string? Medicines { get; set; }
    public string InvoiceStatus { get; set; } = null!;
    public decimal? InvoiceAmount { get; set; }
    public bool IsApproved { get; set; } // ✅ Should be here

    // Navigation properties
    public virtual Doctor Doctor { get; set; } = null!;
    public virtual Patient Patient { get; set; } = null!;
    public virtual Prescription Prescription { get; set; }
}
>>>>>>> origin/bycts9
