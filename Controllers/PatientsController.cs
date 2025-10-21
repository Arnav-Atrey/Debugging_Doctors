using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hospital_Management_system.Models;
using Hospital_Management_system.Models.DTOs;

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

        // DELETE: api/Patients/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null)
            {
                return NotFound();
            }

            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PatientExists(int id)
        {
            return _context.Patients.Any(e => e.PatientId == id);
        }

        // Utility function to calculate age from DOB
        private int CalculateAge(DateOnly? dob)
        {
            if (!dob.HasValue) return 0;

            var today = DateOnly.FromDateTime(DateTime.Today);
            var age = today.Year - dob.Value.Year;
            if (dob.Value > today.AddYears(-age)) age--;
            return age;
        }

    }
}