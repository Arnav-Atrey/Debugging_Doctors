using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hospital_Management_system.Models
{
    public class Prescription
    {
        [Key]
        public int PrescriptionID { get; set; }

        [Required]
        public int AppointmentID { get; set; }

        public string Diagnosis { get; set; }

        public string MedicinesJson { get; set; }  // JSON-serialized list of medicines

        public string ChiefComplaints { get; set; }

        public string PastHistory { get; set; }

        public string Examination { get; set; }

        public string Advice { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("AppointmentID")]
        public virtual Appointment Appointment { get; set; }
    }
}