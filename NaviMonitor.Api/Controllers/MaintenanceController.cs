using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NaviMonitor.Api.Models;

namespace NaviMonitor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MaintenanceController : ControllerBase
{
    private readonly AppDbContext _context;

    public MaintenanceController(AppDbContext context)
    {
        _context = context;
    }

    // GET: /api/maintenance
    [HttpGet]
    public async Task<IActionResult> GetAllLogs()
    {
        var logs = await _context.MaintenanceLogs.OrderByDescending(l => l.Date).ToListAsync();
        return Ok(logs);
    }

    // GET: /api/maintenance/vehicle/1
    [HttpGet("vehicle/{vehicleId}")]
    public async Task<IActionResult> GetLogsByVehicle(int vehicleId)
    {
        var logs = await _context.MaintenanceLogs
            .Where(l => l.VehicleId == vehicleId)
            .OrderByDescending(l => l.Date)
            .ToListAsync();

        return Ok(logs);
    }

    // GET: /api/maintenance/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetLog(int id)
    {
        var log = await _context.MaintenanceLogs.FindAsync(id);

        if (log == null)
        {
            return NotFound("Maintenance log not found.");
        }

        return Ok(log);
    }

    // POST: /api/maintenance
    [HttpPost]
    public async Task<IActionResult> AddLog(MaintenanceLog newLog)
    {
        var vehicleExists = await _context.Vehicles.AnyAsync(v => v.Id == newLog.VehicleId);
        if (!vehicleExists)
        {
            return BadRequest($"Cannot add log. Vehicle with ID {newLog.VehicleId} does not exist.");
        }

        _context.MaintenanceLogs.Add(newLog);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetLog), new { id = newLog.Id }, newLog);
    }

    // DELETE: /api/maintenance/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLog(int id)
    {
        var log = await _context.MaintenanceLogs.FindAsync(id);

        if (log == null)
        {
            return NotFound("Maintenance log not found.");
        }

        _context.MaintenanceLogs.Remove(log);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
