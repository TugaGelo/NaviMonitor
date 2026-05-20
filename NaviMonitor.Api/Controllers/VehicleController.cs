using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NaviMonitor.Api.Models;
using System.Security.Claims;

namespace NaviMonitor.Api.Controllers;

[AllowAnonymous]
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
        var vehicles = await _context.Vehicles.ToListAsync();
        return Ok(vehicles);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetVehicle(int id)
    {
        var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == id);
        if (vehicle == null) return NotFound("Vehicle not found.");
        return Ok(vehicle);
    }

    [HttpPost]
    public async Task<IActionResult> AddVehicle(Vehicle newVehicle)
    {
        newVehicle.Id = 0;

        if (!string.IsNullOrEmpty(CurrentUserId))
        {
            newVehicle.UserId = CurrentUserId;
        }
        else if (string.IsNullOrEmpty(newVehicle.UserId))
        {
            newVehicle.UserId = "DEV_USER_GELO";
        }

        _context.Vehicles.Add(newVehicle);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVehicle), new { id = newVehicle.Id }, newVehicle);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVehicle(int id)
    {
        var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == id);
        if (vehicle == null) return NotFound("Vehicle not found.");

        _context.Vehicles.Remove(vehicle);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
