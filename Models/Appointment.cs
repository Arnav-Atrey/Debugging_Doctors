using System;
using System.Collections.Generic;

namespace Hospital_Management_system.Models;

public partial class Appointment
{
    public int AppointmentId { get; set; }

    public int PatientId { get; set; }

    public int DoctorId { get; set; }

    public string AppointmentStatus { get; set; } = null!;

    public DateTime AppointmentDate { get; set; }

    public string? Symptoms { get; set; }

    public string? Diagnosis { get; set; }

    public string? Medicines { get; set; }

    public string InvoiceStatus { get; set; } = null!;

    public decimal? InvoiceAmount { get; set; }

    public virtual Doctor Doctor { get; set; } = null!;

    public virtual Patient Patient { get; set; } = null!;

    // Existing Appointment class...
    public virtual Prescription Prescription { get; set; }  // 1:1 relationship (optional: use ICollection<Prescription> for 1:M)s
}
