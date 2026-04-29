using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NaviMonitor.Api.Models;
using System.Security.Claims;

namespace NaviMonitor.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class VehicleController : ControllerBase
{
    private readonly AppDbContext _context;

    public VehicleController(AppDbContext context)
    {
        _context = context;
    }

    private string CurrentUserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

    [HttpGet]
    public async Task<IActionResult> GetAllVehicles()
    {
        // 🔍 Only show vehicles belonging to Gelo
        var vehicles = await _context.Vehicles
            .Where(v => v.UserId == CurrentUserId)
            .ToListAsync();
        return Ok(vehicles);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetVehicle(int id)
    {
        var vehicle = await _context.Vehicles
            .FirstOrDefaultAsync(v => v.Id == id && v.UserId == CurrentUserId);

        if (vehicle == null) return NotFound("Vehicle not found or you don't own it.");

        return Ok(vehicle);
    }

    [HttpPost]
    public async Task<IActionResult> AddVehicle(Vehicle newVehicle)
    {
        newVehicle.UserId = CurrentUserId;

        _context.Vehicles.Add(newVehicle);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVehicle), new { id = newVehicle.Id }, newVehicle);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVehicle(int id)
    {
        var vehicle = await _context.Vehicles
            .FirstOrDefaultAsync(v => v.Id == id && v.UserId == CurrentUserId);

        if (vehicle == null) return NotFound("Cannot delete what you don't own.");

        _context.Vehicles.Remove(vehicle);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
