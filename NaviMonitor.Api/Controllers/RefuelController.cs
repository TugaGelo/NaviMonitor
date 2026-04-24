using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NaviMonitor.Api.Models;

namespace NaviMonitor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RefuelController : ControllerBase
{
    private readonly AppDbContext _context;

    public RefuelController(AppDbContext context)
    {
        _context = context;
    }

    // GET: /api/refuel
    [HttpGet]
    public async Task<IActionResult> GetAllLogs()
    {
        var logs = await _context.RefuelLogs.ToListAsync();

        return Ok(logs);
    }

    // GET: /api/refuel/stats/{vehicleId}
    [HttpGet("stats/{vehicleId}")]
    public async Task<IActionResult> GetFuelEconomy(int vehicleId)
    {
        var logs = await _context.RefuelLogs
            .Where(log => log.VehicleId == vehicleId)
            .OrderByDescending(log => log.Date)
            .Take(2)
            .ToListAsync();

        if (logs.Count < 2)
        {
            return BadRequest(new { Message = "Need at least 2 gas receipts to calculate fuel economy." });
        }

        var newestLog = logs[0];
        var previousLog = logs[1];

        var distanceTraveled = newestLog.Odometer - previousLog.Odometer;

        if (newestLog.Volume <= 0) return BadRequest("Volume must be greater than zero.");

        var fuelEconomy = distanceTraveled / newestLog.Volume;

        return Ok(new
        {
            VehicleId = vehicleId,
            DistanceTraveled = distanceTraveled,
            FuelConsumed = newestLog.Volume,
            KilometersPerLiter = Math.Round(fuelEconomy, 2)
        });
    }

    // POST: /api/refuel
    [HttpPost]
    public async Task<IActionResult> AddLog(RefuelLog newLog)
    {
        var highestOdometer = await _context.RefuelLogs
            .Where(log => log.VehicleId == newLog.VehicleId)
            .MaxAsync(log => (int?)log.Odometer) ?? 0;

        if (newLog.Odometer <= highestOdometer)
        {
            return BadRequest($"Invalid Odometer. The reading must be higher than your last recorded mileage ({highestOdometer}).");
        }

        _context.RefuelLogs.Add(newLog);
        await _context.SaveChangesAsync();

        return Ok(newLog);
    }

    // PUT: /api/refuel/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLog(int id, RefuelLog updatedLog)
    {
        if (id != updatedLog.Id)
        {
            return BadRequest("The ID in the URL must match the ID in the data.");
        }

        _context.Entry(updatedLog).State = EntityState.Modified;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: /api/refuel/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLog(int id)
    {
        var log = await _context.RefuelLogs.FindAsync(id);

        if (log == null)
        {
            return NotFound("Oops! Gas receipt not found.");
        }

        _context.RefuelLogs.Remove(log);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
