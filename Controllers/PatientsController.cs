using Hospital_Management_system.Models;
using Hospital_Management_system.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Hospital_Management_system.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientsController : ControllerBase
    {
        private readonly DebuggingDoctorsContext _context;

        public PatientsController(DebuggingDoctorsContext context)
        {
            _context = context;
        }

        // GET: api/Patients
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientDto>>> GetPatients()
        {
            var patients = await _context.Patients.ToListAsync();

            // Map to PatientDto and calculate age
            var patientDtos = patients.Select(patient => new PatientDto
            {
                FullName = patient.FullName,
                Gender = patient.Gender,
                ContactNo = patient.ContactNo,
                Address = patient.Address,
                Aadhaar_no = patient.Aadhaar_no,
                Age = CalculateAge(patient.Dob)
            }).ToList();

            return patientDtos;
        }

        // GET: api/Patients/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PatientDto>> GetPatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);

            if (patient == null)
            {
                return NotFound();
            }

            // Map to PatientDto and calculate age
            var patientDto = new PatientDto
            {
                FullName = patient.FullName,
                Gender = patient.Gender,
                ContactNo = patient.ContactNo,
                Address = patient.Address,
                Aadhaar_no = patient.Aadhaar_no,
                Age = CalculateAge(patient.Dob)
            };

            return patientDto;
        }

        // PUT: api/Patients/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPatient(int id, [FromBody] PatientUpdateDto patientDto)
        {
            if (id != patientDto.PatientId)
            {
                return BadRequest(new { message = "Patient ID mismatch" });
            }

            var patient = await _context.Patients.FindAsync(id);
            if (patient == null)
            {
                return NotFound(new { message = "Patient not found" });
            }

            // Update only the fields from DTO
            patient.FullName = patientDto.FullName;
            patient.Dob = patientDto.Dob;
            patient.Gender = patientDto.Gender;
            patient.ContactNo = patientDto.ContactNo;
            patient.Address = patientDto.Address;
            patient.Aadhaar_no = patientDto.Aadhaar_no;
            // Note: UserId should not be changed

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PatientExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Profile updated successfully" });
        }

        // GET: api/Patients/list
        [HttpGet("list")]
        public async Task<ActionResult<IEnumerable<PatientListDto>>> GetPatientsList()
        {
            var patients = await _context.Patients
                .Include(p => p.User)
                .ToListAsync();

            var patientDtos = patients.Select(p => new PatientListDto
            {
                PatientId = p.PatientId,
                UserId = p.UserId,
                FullName = p.FullName,
                Email = p.User.Email,
                Dob = p.Dob,
                Age = CalculateAge(p.Dob),
                Gender = p.Gender,
                ContactNo = p.ContactNo,
                Address = p.Address,
                Aadhaar_no = p.Aadhaar_no,
                CreatedAt = p.User.CreatedAt
            }).ToList();

            return patientDtos;
        }

        // Helper method to calculate age
        private int CalculateAge(DateOnly? dob)
        {
            if (!dob.HasValue) return 0;

            var today = DateOnly.FromDateTime(DateTime.Today);
            var age = today.Year - dob.Value.Year;
            if (dob.Value > today.AddYears(-age))
                age--;

            return age;
        }

        // GET: api/Patients/check-contact/{contactNo}
        [HttpGet("check-contact/{contactNo}")]
        public async Task<ActionResult<bool>> CheckContactExists(string contactNo, [FromQuery] int? excludePatientId)
        {
            var exists = await _context.Patients
                .AnyAsync(p => p.ContactNo == contactNo && p.PatientId != excludePatientId);

            return Ok(new { exists });
        }

        // GET: api/Patients/check-aadhaar/{aadhaarNo}]
        [HttpGet("check-aadhaar/{aadhaarNo}")]
        public async Task<ActionResult<bool>> CheckAadhaarExists(string aadhaarNo, [FromQuery] int? excludePatientId)
        {
            var exists = await _context.Patients
                .AnyAsync(p => p.Aadhaar_no == aadhaarNo && p.PatientId != excludePatientId);

            return Ok(new { exists });
        }

        // POST: api/Patients
        [HttpPost]
        public async Task<ActionResult<Patient>> PostPatient(Patient patient)
        {
            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPatient", new { id = patient.PatientId }, patient);
        }

        // GET: api/Patients/deleted (Admin only)
        [HttpGet("deleted")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<PatientListDto>>> GetDeletedPatients()
        {
            var deletedPatients = await _context.Patients
                .IgnoreQueryFilters()
                .Include(p => p.User)
                .Where(p => p.IsDeleted)
                .ToListAsync();

            // Calculate age in memory after fetching from database
            var patientDtos = deletedPatients.Select(p => new PatientListDto
            {
                PatientId = p.PatientId,
                UserId = p.UserId,
                FullName = p.FullName,
                Email = p.User.Email,
                Dob = p.Dob,
                Age = CalculateAge(p.Dob),
                Gender = p.Gender,
                ContactNo = p.ContactNo,
                Address = p.Address,
                Aadhaar_no = p.Aadhaar_no,
                CreatedAt = p.User.CreatedAt
            }).ToList();

            return patientDtos;
        }



        // DELETE: api/Patients/5 (Soft Delete)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePatient(int id, [FromBody] SoftDeleteDto deleteDto)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null)
            {
                return NotFound();
            }

            patient.IsDeleted = true;
            patient.DeletedAt = DateTime.UtcNow;
            patient.DeletedBy = deleteDto.DeletedBy;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Patient soft deleted successfully" });
        }

        // PUT: api/Patients/5/restore (Admin only)
        [HttpPut("{id}/restore")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RestorePatient(int id)
        {
            var patient = await _context.Patients
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.PatientId == id && p.IsDeleted);

            if (patient == null)
            {
                return NotFound(new { message = "Deleted patient not found" });
            }

            patient.IsDeleted = false;
            patient.DeletedAt = null;
            patient.DeletedBy = null;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Patient restored successfully" });
        }

        // DELETE: api/Patients/5/permanent (Hard Delete)
        [HttpDelete("{id}/permanent")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PermanentDeletePatient(int id)
        {
            var patient = await _context.Patients
                .IgnoreQueryFilters()
                .Include(p => p.Appointments) // Include appointments to check
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.PatientId == id);

            if (patient == null)
            {
                return NotFound();
            }

            // Delete related appointments first (cascade delete)
            if (patient.Appointments != null && patient.Appointments.Any())
            {
                // Delete all prescriptions associated with appointments
                var appointmentIds = patient.Appointments.Select(a => a.AppointmentId).ToList();
                var prescriptions = await _context.Prescriptions
                    .Where(p => appointmentIds.Contains(p.AppointmentID))
                    .ToListAsync();

                if (prescriptions.Any())
                {
                    _context.Prescriptions.RemoveRange(prescriptions);
                }

                // Now delete appointments
                _context.Appointments.RemoveRange(patient.Appointments);
            }

            // Delete the user account (this should cascade to patient, but we'll do it explicitly)
            if (patient.User != null)
            {
                _context.Users.Remove(patient.User);
            }

            // Delete the patient
            _context.Patients.Remove(patient);

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Patient and related records permanently deleted" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Failed to permanently delete patient",
                    error = ex.Message
                });
            }
        }

        private bool PatientExists(int id)
        {
            return _context.Patients.Any(e => e.PatientId == id);
        }

        // Utility function to calculate age from DOB
        //private int CalculateAge(DateOnly? dob)
        //{
        //    if (!dob.HasValue) return 0;

        //    var today = DateOnly.FromDateTime(DateTime.Today);
        //    var age = today.Year - dob.Value.Year;
        //    if (dob.Value > today.AddYears(-age)) age--;
        //    return age;
        //}

    }
}