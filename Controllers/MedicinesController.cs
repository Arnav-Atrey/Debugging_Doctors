// Controllers/MedicinesController.cs
using Hospital_Management_system.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class MedicinesController : ControllerBase
{
    private readonly DebuggingDoctorsContext _context;

    public MedicinesController(DebuggingDoctorsContext context) => _context = context;

    [HttpGet("by-specialization/{specialization}")]
    public async Task<ActionResult<IEnumerable<Medicine>>> GetBySpecialization(string specialization)
    {
        var meds = await _context.Medicines
            .Where(m => m.Specialization == specialization)
            .OrderBy(m => m.Name)
            .Select(m => new { m.MedicineID, m.Name, m.PricePerTablet })
            .ToListAsync();

        return Ok(meds);
    }
}