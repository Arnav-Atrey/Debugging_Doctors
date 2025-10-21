using Hospital_Management_system.Models;
using Hospital_Management_system.Models.DTOs;
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
    public class DoctorsController : ControllerBase
    {
        private readonly DebuggingDoctorsContext _context;

        public DoctorsController(DebuggingDoctorsContext context)
        {
            _context = context;
        }

        // GET: api/Doctors
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Doctor>>> GetDoctors()
        {
            return await _context.Doctors.ToListAsync();
        }

        // GET: api/Doctors/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DoctorDto>> GetDoctor(int id)
        {
            var doctor = await _context.Doctors
                .Where(d => d.DocId == id)
                .Select(d => new DoctorDto
                {
                    DocId = d.DocId,
                    FullName = d.FullName,
                    Specialisation = d.Specialisation,
                    HPID = d.HPID,
                    Availability = d.Availability,
                    ContactNo = d.ContactNo
                })
                .FirstOrDefaultAsync();

            if (doctor == null)
            {
                return NotFound(new { message = "Doctor not found" });
            }

            return Ok(doctor);
        }

        // PUT: api/Doctors/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDoctor(int id, [FromBody] DoctorUpdateDto doctorDto)
        {
            if (id != doctorDto.DocId)
            {
                return BadRequest(new { message = "Doctor ID mismatch" });
            }

            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null)
            {
                return NotFound(new { message = "Doctor not found" });
            }

            // Update only the fields from DTO
            doctor.FullName = doctorDto.FullName;
            doctor.Specialisation = doctorDto.Specialisation;
            doctor.HPID = doctorDto.HPID;
            doctor.Availability = doctorDto.Availability;
            doctor.ContactNo = doctorDto.ContactNo;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DoctorExists(id))
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

        // GET: api/Doctors/check-contact/{contactNo}
        [HttpGet("check-contact/{contactNo}")]
        public async Task<ActionResult<bool>> CheckContactExists(string contactNo, [FromQuery] int? excludeDoctorId)
        {
            var exists = await _context.Doctors
                .AnyAsync(d => d.ContactNo == contactNo && d.DocId != excludeDoctorId);

            return Ok(new { exists });
        }

        // GET: api/Doctors/check-hpid/{hpid}
        [HttpGet("check-hpid/{hpid}")]
        public async Task<ActionResult<bool>> CheckHpidExists(string hpid, [FromQuery] int? excludeDoctorId)
        {
            var exists = await _context.Doctors
                .AnyAsync(d => d.HPID == hpid && d.DocId != excludeDoctorId);

            return Ok(new { exists });
        }

        // POST: api/Doctors
        [HttpPost]
        public async Task<ActionResult<Doctor>> PostDoctor(Doctor doctor)
        {
            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDoctor", new { id = doctor.DocId }, doctor);
        }

        // DELETE: api/Doctors/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null)
            {
                return NotFound();
            }

            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Doctors/specialization/{specialization}
        [HttpGet("specialization/{specialization}")]
        public async Task<ActionResult<IEnumerable<Doctor>>> GetDoctorsBySpecialization(string specialization)
        {
            var doctors = await _context.Doctors
                .Where(d => d.Specialisation.ToLower().Contains(specialization.ToLower()))
                .ToListAsync();

            return doctors;
        }

        private bool DoctorExists(int id)
        {
            return _context.Doctors.Any(e => e.DocId == id);
        }
    }
}