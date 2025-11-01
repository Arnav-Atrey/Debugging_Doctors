using Hospital_Management_system.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class MedicinesController : ControllerBase
{
    private readonly DebuggingDoctorsContext _context;

    public MedicinesController(DebuggingDoctorsContext context) => _context = context;

    // NEW: Get all medicines without specialization filter
    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<object>>> GetAllMedicines()
    {
        var meds = await _context.Set<Medicine>()
            .OrderBy(m => m.Name)
            .Select(m => new { m.MedicineID, m.Name, m.PricePerTablet })
            .ToListAsync();

        return Ok(meds);
    }

    // Keep existing endpoint for backward compatibility
    [HttpGet("specialization/{specialization}")]
    public async Task<ActionResult<IEnumerable<object>>> GetBySpecialization(string specialization)
    {
        var meds = await _context.Set<Medicine>()
            .Where(m => m.Specialization == specialization)
            .OrderBy(m => m.Name)
            .Select(m => new { m.MedicineID, m.Name, m.PricePerTablet })
            .ToListAsync();

        return Ok(meds);
    }
}