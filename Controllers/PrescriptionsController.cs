using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Hospital_Management_system.Models;
using Hospital_Management_system.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital_Management_system.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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

        // POST: api/Prescriptions
        [HttpPost]
        public async Task<ActionResult<PrescriptionDto>> CreatePrescription([FromBody] PrescriptionDto dto)
        {
            if (dto == null || dto.AppointmentId <= 0)
                return BadRequest("Invalid prescription data.");

            var appointment = await _context.Appointments.FindAsync(dto.AppointmentId);
            if (appointment == null)
                return NotFound("Appointment not found.");

            if (appointment.AppointmentStatus != "Confirmed")
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
        }

        // PUT: api/Prescriptions/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePrescription(int id, [FromBody] PrescriptionDto dto)
        {
            var prescription = await _context.Prescriptions.FindAsync(id);
            if (prescription == null)
                return NotFound("Prescription not found.");

            prescription.Diagnosis = dto.Diagnosis ?? prescription.Diagnosis;
            prescription.MedicinesJson = JsonSerializer.Serialize(dto.Medicines ?? JsonSerializer.Deserialize<List<MedicineDto>>(prescription.MedicinesJson));
            prescription.ChiefComplaints = dto.ChiefComplaints ?? prescription.ChiefComplaints;
            prescription.PastHistory = dto.PastHistory ?? prescription.PastHistory;
            prescription.Examination = dto.Examination ?? prescription.Examination;
            prescription.Advice = dto.Advice ?? prescription.Advice;
            prescription.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Prescription updated successfully" });
        }

        // DELETE: api/Prescriptions/{id}
        [HttpDelete("{id}")]
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
                Medicines = string.IsNullOrEmpty(p.MedicinesJson) ? new List<MedicineDto>() : JsonSerializer.Deserialize<List<MedicineDto>>(p.MedicinesJson),
                ChiefComplaints = p.ChiefComplaints,
                PastHistory = p.PastHistory,
                Examination = p.Examination,
                Advice = p.Advice
            };
        }
    }
}