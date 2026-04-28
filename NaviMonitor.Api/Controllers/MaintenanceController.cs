using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NaviMonitor.Api.Models;
using NaviMonitor.Api.Services;
using System.IO;
using System.Threading.Tasks;

namespace NaviMonitor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MaintenanceController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly MaintenanceAIService _aiService;

    public MaintenanceController(AppDbContext context, MaintenanceAIService aiService)
    {
        _context = context;
        _aiService = aiService;
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

    // PUT: /api/maintenance/1
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLog(int id, MaintenanceLog updatedLog)
    {
        if (id != updatedLog.Id)
        {
            return BadRequest("Log ID mismatch.");
        }

        _context.Entry(updatedLog).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.MaintenanceLogs.AnyAsync(e => e.Id == id))
            {
                return NotFound("Maintenance log not found.");
            }
            else
            {
                throw;
            }
        }

        return NoContent();
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

    // POST: /api/maintenance/debug-scan
    [HttpPost("debug-scan")]
    public async Task<IActionResult> DebugScan(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Please upload an image of a manual.");

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        var fileBytes = ms.ToArray();

        var jsonResult = await _aiService.ProcessManualImage(fileBytes);

        return Content(jsonResult, "application/json");
    }

    // POST: /api/maintenance/sync-manual/1
    [HttpPost("sync-manual/{vehicleId}")]
    public async Task<IActionResult> SyncManual(int vehicleId, IFormFile file)
    {
        var vehicle = await _context.Vehicles.FindAsync(vehicleId);
        if (vehicle == null) return NotFound("Vehicle not found.");

        if (file == null || file.Length == 0) return BadRequest("No image provided.");

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        var jsonResult = await _aiService.ProcessManualImage(ms.ToArray());

        vehicle.MaintenanceMatrixJson = jsonResult;
        vehicle.HasSyncedManual = true;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Manual synced successfully!", data = jsonResult });
    }
}
