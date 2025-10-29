using Hospital_Management_system.Models;
using Hospital_Management_system.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
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
    [Authorize]
    public class DoctorsController : ControllerBase
    {
        private readonly DebuggingDoctorsContext _context;

        public DoctorsController(DebuggingDoctorsContext context)
        {
            _context = context;
        }

        // GET: api/Doctors
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Doctor>>> GetDoctors()
        {
            // Query filter automatically excludes soft-deleted records
            return await _context.Doctors.ToListAsync();
        }

        // GET: api/Doctors/deleted (Admin only)
        [HttpGet("deleted")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Doctor>>> GetDeletedDoctors()
        {
            // Use IgnoreQueryFilters to get deleted records
            var deletedDoctors = await _context.Doctors
                .IgnoreQueryFilters()
                .Where(d => d.IsDeleted)
                .ToListAsync();

            return deletedDoctors;
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
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<IActionResult> PutDoctor(int id, [FromBody] DoctorUpdateDto doctorDto)
        {
            // Get current user's ID from JWT claims
            var userIdClaim = User.FindFirst("UserId")?.Value;

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

        // DELETE: api/Doctors/5 (Soft Delete)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDoctor(int id, [FromBody] SoftDeleteDto deleteDto)
        {
            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null)
            {
                return NotFound();
            }

            // Soft delete
            doctor.IsDeleted = true;
            doctor.DeletedAt = DateTime.UtcNow;
            doctor.DeletedBy = deleteDto.DeletedBy;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Doctor soft deleted successfully" });
        }

        // PUT: api/Doctors/5/restore (Admin only)
        [HttpPut("{id}/restore")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RestoreDoctor(int id, [FromBody] RestoreDto restoreDto)
        {
            // Use IgnoreQueryFilters to find soft-deleted doctor
            var doctor = await _context.Doctors
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(d => d.DocId == id && d.IsDeleted);

            if (doctor == null)
            {
                return NotFound(new { message = "Deleted doctor not found" });
            }

            // Restore
            doctor.IsDeleted = false;
            doctor.DeletedAt = null;
            doctor.DeletedBy = null;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Doctor restored successfully" });
        }

        // DELETE: api/Doctors/5/permanent (Admin only - Hard Delete)
        [HttpDelete("{id}/permanent")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PermanentDeleteDoctor(int id)
        {
            var doctor = await _context.Doctors
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(d => d.DocId == id);

            if (doctor == null)
            {
                return NotFound();
            }

            // Use Remove instead of setting IsDeleted to perform hard delete
            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Doctor permanently deleted" });
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