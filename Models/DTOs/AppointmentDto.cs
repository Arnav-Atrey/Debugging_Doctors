<<<<<<< HEAD
﻿namespace Hospital_Management_system.Models.DTOs
{
    public class AppointmentBookingDto
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string? Symptoms { get; set; }
    }

    public class AppointmentResponseDto
    {
        public int AppointmentId { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public int DoctorId { get; set; }
        public string DoctorName { get; set; }
        public string Specialisation { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string AppointmentStatus { get; set; }
        public string? Symptoms { get; set; }
        public string? Diagnosis { get; set; }
        public string? Medicines { get; set; }
        public string InvoiceStatus { get; set; }
        public decimal? InvoiceAmount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AppointmentActionDto
    {
        public string? Reason { get; set; }
    }

    public class AppointmentCompletionDto
    {
        public string? Diagnosis { get; set; }
        public string? Medicines { get; set; }
        public decimal? InvoiceAmount { get; set; }
    }
    public class PaymentUpdateDto
    {
        public string InvoiceStatus { get; set; } = null!; // "Pending", "Paid", "Cancelled"
    }
=======
﻿namespace Hospital_Management_system.Models.DTOs
{
    public class AppointmentBookingDto
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string? Symptoms { get; set; }
    }

    public class AppointmentResponseDto
    {
        public int AppointmentId { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public int DoctorId { get; set; }
        public string DoctorName { get; set; }
        public string Specialisation { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string AppointmentStatus { get; set; }
        public string? Symptoms { get; set; }
        public string? Diagnosis { get; set; }
        public string? Medicines { get; set; }
        public string InvoiceStatus { get; set; }
        public decimal? InvoiceAmount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AppointmentActionDto
    {
        public string? Reason { get; set; }
    }

    public class AppointmentCompletionDto
    {
        public string? Diagnosis { get; set; }
        public string? Medicines { get; set; }
        public decimal? InvoiceAmount { get; set; }
    }
    public class PaymentUpdateDto
    {
        public string InvoiceStatus { get; set; } = null!; // "Pending", "Paid", "Cancelled"
    }
>>>>>>> origin/bycts9
}