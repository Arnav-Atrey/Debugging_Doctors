using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hospital_Management_system.Models;
using Hospital_Management_system.Models.DTOs;

namespace Hospital_Management_system.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminsController : ControllerBase
    {
        private readonly DebuggingDoctorsContext _context;

        public AdminsController(DebuggingDoctorsContext context)
        {
            _context = context;
        }

        // GET: api/Admins
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdminDto>>> GetAdmins()
        {
            var admins = await _context.Admins
                .Include(a => a.User)
                .Include(a => a.ApprovedByAdmin)
                .Select(a => new AdminDto
                {
                    AdminId = a.AdminId,
                    UserId = a.UserId,
                    FullName = a.FullName,
                    Email = a.User.Email,
                    Department = a.Department,
                    ContactNo = a.ContactNo,
                    IsApproved = a.IsApproved,
                    ApprovedByName = a.ApprovedByAdmin != null ? a.ApprovedByAdmin.FullName : null,
                    ApprovedAt = a.ApprovedAt,
                    CreatedAt = a.User.CreatedAt
                })
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return admins;
        }

        // GET: api/Admins/pending
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<AdminDto>>> GetPendingAdmins()
        {
            var pendingAdmins = await _context.Admins
                .Include(a => a.User)
                .Where(a => !a.IsApproved)
                .Select(a => new AdminDto
                {
                    AdminId = a.AdminId,
                    UserId = a.UserId,
                    FullName = a.FullName,
                    Email = a.User.Email,
                    Department = a.Department,
                    ContactNo = a.ContactNo,
                    IsApproved = a.IsApproved,
                    CreatedAt = a.User.CreatedAt
                })
                .OrderBy(a => a.CreatedAt)
                .ToListAsync();

            return pendingAdmins;
        }

        // GET: api/Admins/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AdminDto>> GetAdmin(int id)
        {
            var admin = await _context.Admins
                .Include(a => a.User)
                .Include(a => a.ApprovedByAdmin)
                .Where(a => a.AdminId == id)
                .Select(a => new AdminDto
                {
                    AdminId = a.AdminId,
                    UserId = a.UserId,
                    FullName = a.FullName,
                    Email = a.User.Email,
                    Department = a.Department,
                    ContactNo = a.ContactNo,
                    IsApproved = a.IsApproved,
                    ApprovedByName = a.ApprovedByAdmin != null ? a.ApprovedByAdmin.FullName : null,
                    ApprovedAt = a.ApprovedAt,
                    CreatedAt = a.User.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (admin == null)
            {
                return NotFound();
            }

            return admin;
        }

        // PUT: api/Admins/5/approve
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveAdmin(int id, [FromBody] AdminApprovalDto approvalDto)
        {
            var admin = await _context.Admins.FindAsync(id);
            if (admin == null)
            {
                return NotFound(new { message = "Admin not found" });
            }

            if (admin.IsApproved)
            {
                return BadRequest(new { message = "Admin is already approved" });
            }

            // Verify that the approver is an approved admin
            var approver = await _context.Admins.FindAsync(approvalDto.ApprovedBy);
            if (approver == null || !approver.IsApproved)
            {
                return BadRequest(new { message = "Only approved admins can approve new admins" });
            }

            admin.IsApproved = true;
            admin.ApprovedBy = approvalDto.ApprovedBy;
            admin.ApprovedAt = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AdminExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Admin approved successfully" });
        }

        // PUT: api/Admins/5/reject
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectAdmin(int id)
        {
            var admin = await _context.Admins.FindAsync(id);
            if (admin == null)
            {
                return NotFound(new { message = "Admin not found" });
            }

            // Delete the admin record and associated user
            var user = await _context.Users.FindAsync(admin.UserId);
            if (user != null)
            {
                _context.Users.Remove(user); // This will cascade delete the admin
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Admin application rejected and removed" });
        }

        // GET: api/Admins/stats
        [HttpGet("stats")]
        public async Task<ActionResult<AdminStatsDto>> GetStats()
        {
            var stats = new AdminStatsDto
            {
                TotalDoctors = await _context.Doctors.CountAsync(),
                TotalPatients = await _context.Patients.CountAsync(),
                TotalAppointments = await _context.Appointments.CountAsync(),
                PendingAppointments = await _context.Appointments
                    .CountAsync(a => a.AppointmentStatus == "Pending"),
                CompletedAppointments = await _context.Appointments
                    .CountAsync(a => a.AppointmentStatus == "Completed"),
                PendingAdmins = await _context.Admins
                    .CountAsync(a => !a.IsApproved)
            };

            return Ok(stats);
        }

        // PUT: api/Admins/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAdmin(int id, [FromBody] AdminUpdateDto adminDto)
        {
            if (id != adminDto.AdminId)
            {
                return BadRequest(new { message = "Admin ID mismatch" });
            }

            var admin = await _context.Admins.FindAsync(id);
            if (admin == null)
            {
                return NotFound(new { message = "Admin not found" });
            }

            admin.FullName = adminDto.FullName;
            admin.Department = adminDto.Department;
            admin.ContactNo = adminDto.ContactNo;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AdminExists(id))
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

        private bool AdminExists(int id)
        {
            return _context.Admins.Any(e => e.AdminId == id);
        }
    }
}