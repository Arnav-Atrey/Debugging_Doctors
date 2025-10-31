using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Hospital_Management_system.Models;
using Hospital_Management_system.Models.DTOs;
<<<<<<< HEAD
using Microsoft.AspNetCore.Authorization;
=======
>>>>>>> origin/bycts9
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital_Management_system.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
<<<<<<< HEAD
    [Authorize]
=======
>>>>>>> origin/bycts9
    public class PrescriptionsController : ControllerBase
    {
        private readonly DebuggingDoctorsContext _context;

        public PrescriptionsController(DebuggingDoctorsContext context)
        {
            _context = context;
        }

        // GET: api/Prescriptions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PrescriptionDto>>> GetPrescriptions()
        {
            var prescriptions = await _context.Prescriptions.ToListAsync();
            var dtos = prescriptions.Select(p => MapToDto(p)).ToList();
            return Ok(dtos);
        }

        // GET: api/Prescriptions/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PrescriptionDto>> GetPrescription(int id)
        {
            var prescription = await _context.Prescriptions.FindAsync(id);
            if (prescription == null)
                return NotFound("Prescription not found.");

            return Ok(MapToDto(prescription));
        }

        // GET: api/Prescriptions/appointment/{appointmentId}
        [HttpGet("appointment/{appointmentId}")]
        public async Task<ActionResult<PrescriptionDto>> GetPrescriptionByAppointment(int appointmentId)
        {
            var prescription = await _context.Prescriptions
                .FirstOrDefaultAsync(p => p.AppointmentID == appointmentId);

            if (prescription == null)
                return NotFound("Prescription not found for this appointment.");

            return Ok(MapToDto(prescription));
        }

<<<<<<< HEAD
        // POST: api/Prescriptions/save-with-completion
        [HttpPost("save-with-completion")]
        [Authorize(Roles = "Doctor")]
        public async Task<ActionResult> SavePrescriptionAndComplete([FromBody] PrescriptionDto dto)
=======
        // POST: api/Prescriptions
        [HttpPost]
        public async Task<ActionResult<PrescriptionDto>> CreatePrescription([FromBody] PrescriptionDto dto)
>>>>>>> origin/bycts9
        {
            if (dto == null || dto.AppointmentId <= 0)
                return BadRequest("Invalid prescription data.");

            var appointment = await _context.Appointments.FindAsync(dto.AppointmentId);
            if (appointment == null)
                return NotFound("Appointment not found.");

            if (appointment.AppointmentStatus != "Confirmed")
<<<<<<< HEAD
                return BadRequest("Only confirmed appointments can be completed with a prescription.");

            // Validate that invoice amount is provided
            if (!dto.InvoiceAmount.HasValue || dto.InvoiceAmount.Value <= 0)
                return BadRequest("Invoice amount is required to complete the appointment.");

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Check if prescription already exists
                var existingPrescription = await _context.Prescriptions
                    .FirstOrDefaultAsync(p => p.AppointmentID == dto.AppointmentId);

                if (existingPrescription != null)
                {
                    // Update existing prescription
                    existingPrescription.Diagnosis = dto.Diagnosis ?? existingPrescription.Diagnosis;
                    existingPrescription.MedicinesJson = JsonSerializer.Serialize(dto.Medicines ?? new List<MedicineDto>());
                    existingPrescription.ChiefComplaints = dto.ChiefComplaints ?? existingPrescription.ChiefComplaints;
                    existingPrescription.PastHistory = dto.PastHistory ?? existingPrescription.PastHistory;
                    existingPrescription.Examination = dto.Examination ?? existingPrescription.Examination;
                    existingPrescription.Advice = dto.Advice ?? existingPrescription.Advice;
                    existingPrescription.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    // Create new prescription
                    var prescription = new Prescription
                    {
                        AppointmentID = dto.AppointmentId,
                        Diagnosis = dto.Diagnosis ?? string.Empty,
                        MedicinesJson = JsonSerializer.Serialize(dto.Medicines ?? new List<MedicineDto>()),
                        ChiefComplaints = dto.ChiefComplaints ?? string.Empty,
                        PastHistory = dto.PastHistory ?? string.Empty,
                        Examination = dto.Examination ?? string.Empty,
                        Advice = dto.Advice ?? string.Empty,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Prescriptions.Add(prescription);
                }

                // Update appointment status and invoice
                appointment.AppointmentStatus = "Completed";
                appointment.Diagnosis = dto.Diagnosis;
                appointment.InvoiceAmount = dto.InvoiceAmount;
                appointment.InvoiceStatus = "Pending"; // Patient needs to pay

                // Generate medicines summary for appointment
                if (dto.Medicines != null && dto.Medicines.Any())
                {
                    appointment.Medicines = string.Join(", ", dto.Medicines.Select(m => m.Name));
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Prescription saved and appointment completed successfully",
                    invoiceAmount = appointment.InvoiceAmount
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Failed to save prescription", error = ex.Message });
            }
=======
                return BadRequest("Only confirmed appointments can have prescriptions.");

            var prescription = new Prescription
            {
                AppointmentID = dto.AppointmentId,
                Diagnosis = dto.Diagnosis ?? string.Empty,
                MedicinesJson = JsonSerializer.Serialize(dto.Medicines ?? new List<MedicineDto>()),
                ChiefComplaints = dto.ChiefComplaints ?? string.Empty,
                PastHistory = dto.PastHistory ?? string.Empty,
                Examination = dto.Examination ?? string.Empty,
                Advice = dto.Advice ?? string.Empty,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Prescriptions.Add(prescription);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPrescription), new { id = prescription.PrescriptionID }, MapToDto(prescription));
>>>>>>> origin/bycts9
        }

        // PUT: api/Prescriptions/{id}
        [HttpPut("{id}")]
<<<<<<< HEAD
        [Authorize(Roles = "Doctor")]
=======
>>>>>>> origin/bycts9
        public async Task<IActionResult> UpdatePrescription(int id, [FromBody] PrescriptionDto dto)
        {
            var prescription = await _context.Prescriptions.FindAsync(id);
            if (prescription == null)
                return NotFound("Prescription not found.");

            prescription.Diagnosis = dto.Diagnosis ?? prescription.Diagnosis;
<<<<<<< HEAD
            prescription.MedicinesJson = JsonSerializer.Serialize(dto.Medicines ?? new List<MedicineDto>());
=======
            prescription.MedicinesJson = JsonSerializer.Serialize(dto.Medicines ?? JsonSerializer.Deserialize<List<MedicineDto>>(prescription.MedicinesJson));
>>>>>>> origin/bycts9
            prescription.ChiefComplaints = dto.ChiefComplaints ?? prescription.ChiefComplaints;
            prescription.PastHistory = dto.PastHistory ?? prescription.PastHistory;
            prescription.Examination = dto.Examination ?? prescription.Examination;
            prescription.Advice = dto.Advice ?? prescription.Advice;
            prescription.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Prescription updated successfully" });
        }

<<<<<<< HEAD
        // GET: api/Prescriptions/appointment/{appointmentId}/pdf-data
        [HttpGet("appointment/{appointmentId}/pdf-data")]
        public async Task<ActionResult<object>> GetPrescriptionPdfData(int appointmentId)
        {
            var prescription = await _context.Prescriptions
                .Include(p => p.Appointment)
                    .ThenInclude(a => a.Patient)
                .Include(p => p.Appointment)
                    .ThenInclude(a => a.Doctor)
                .FirstOrDefaultAsync(p => p.AppointmentID == appointmentId);

            if (prescription == null)
                return NotFound("Prescription not found.");

            var patient = prescription.Appointment.Patient;
            var doctor = prescription.Appointment.Doctor;

            var response = new
            {
                prescription = MapToDto(prescription),
                patientInfo = new
                {
                    name = patient.FullName,
                    age = patient.Dob.HasValue ? CalculateAge(patient.Dob.Value) : 0,
                    gender = patient.Gender,
                    contactNo = patient.ContactNo
                },
                doctorInfo = new
                {
                    name = doctor.FullName,
                    specialisation = doctor.Specialisation,
                    hpid = doctor.HPID
                },
                appointmentDate = prescription.Appointment.AppointmentDate,
                invoiceAmount = prescription.Appointment.InvoiceAmount
            };

            return Ok(response);
        }

        // DELETE: api/Prescriptions/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Doctor,Admin")]
=======
        // DELETE: api/Prescriptions/{id}
        [HttpDelete("{id}")]
>>>>>>> origin/bycts9
        public async Task<IActionResult> DeletePrescription(int id)
        {
            var prescription = await _context.Prescriptions.FindAsync(id);
            if (prescription == null)
                return NotFound("Prescription not found.");

            _context.Prescriptions.Remove(prescription);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Prescription deleted successfully" });
        }

        private PrescriptionDto MapToDto(Prescription p)
        {
            return new PrescriptionDto
            {
                AppointmentId = p.AppointmentID,
                Diagnosis = p.Diagnosis,
<<<<<<< HEAD
                Medicines = string.IsNullOrEmpty(p.MedicinesJson)
                    ? new List<MedicineDto>()
                    : JsonSerializer.Deserialize<List<MedicineDto>>(p.MedicinesJson),
=======
                Medicines = string.IsNullOrEmpty(p.MedicinesJson) ? new List<MedicineDto>() : JsonSerializer.Deserialize<List<MedicineDto>>(p.MedicinesJson),
>>>>>>> origin/bycts9
                ChiefComplaints = p.ChiefComplaints,
                PastHistory = p.PastHistory,
                Examination = p.Examination,
                Advice = p.Advice
            };
        }
<<<<<<< HEAD

        private int CalculateAge(DateOnly dob)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            var age = today.Year - dob.Year;
            if (dob > today.AddYears(-age))
                age--;
            return age;
        }
=======
>>>>>>> origin/bycts9
    }
}