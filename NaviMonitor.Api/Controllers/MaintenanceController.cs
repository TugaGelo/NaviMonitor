using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NaviMonitor.Api.Models;
using NaviMonitor.Api.Services;
using System.IO;
using System.Threading.Tasks;
using System.Text.Json;

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
    public async Task<IActionResult> GetAllLogs() => 
        Ok(await _context.MaintenanceLogs.OrderByDescending(l => l.Date).ToListAsync());

    // GET: /api/maintenance/vehicle/1
    [HttpGet("vehicle/{vehicleId}")]
    public async Task<IActionResult> GetLogsByVehicle(int vehicleId) => 
        Ok(await _context.MaintenanceLogs.Where(l => l.VehicleId == vehicleId).OrderByDescending(l => l.Date).ToListAsync());

    // GET: /api/maintenance/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetLog(int id)
    {
        var log = await _context.MaintenanceLogs.FindAsync(id);
        return log == null ? NotFound("Maintenance log not found.") : Ok(log);
    }

    // POST: /api/maintenance
    [HttpPost]
    public async Task<IActionResult> AddLog(MaintenanceLog newLog)
    {
        if (!await _context.Vehicles.AnyAsync(v => v.Id == newLog.VehicleId)) 
            return BadRequest("Vehicle not found.");

        _context.MaintenanceLogs.Add(newLog);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetLog), new { id = newLog.Id }, newLog);
    }

    // POST: /api/maintenance/analyze
    [HttpPost("analyze")]
    public async Task<IActionResult> AnalyzeManual(List<IFormFile> files)
    {
        if (files == null || files.Count == 0) 
            return BadRequest("Please upload at least one image of a manual.");

        var imagesBytes = new List<byte[]>();
        foreach (var file in files)
        {
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            imagesBytes.Add(ms.ToArray());
        }

        var jsonResult = await _aiService.ProcessManualImages(imagesBytes);
        return Content(jsonResult, "application/json");
    }

    // POST: /api/maintenance/vehicle/1/matrix
    [HttpPost("vehicle/{vehicleId}/matrix")]
    public async Task<IActionResult> SaveMaintenanceMatrix(int vehicleId, [FromBody] SaveMatrixRequest request)
    {
        var vehicle = await _context.Vehicles.FindAsync(vehicleId);
        if (vehicle == null) return NotFound("Vehicle not found.");

        if (request.MatrixData == null)
            return BadRequest("Maintenance matrix data is empty.");

        string serializedJson = JsonSerializer.Serialize(request.MatrixData);

        vehicle.MaintenanceMatrixJson = serializedJson;
        vehicle.HasSyncedManual = true;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Maintenance schedule saved successfully!" });
    }

    // DELETE: /api/maintenance/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLog(int id)
    {
        var log = await _context.MaintenanceLogs.FindAsync(id);
        if (log == null) return NotFound("Maintenance log not found.");

        _context.MaintenanceLogs.Remove(log);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public class SaveMatrixRequest
{
    public object MatrixData { get; set; } = default!;
}
