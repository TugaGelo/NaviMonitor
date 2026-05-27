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
        if (!string.IsNullOrEmpty(CurrentUserId))
        {
            var userVehicles = await _context.Vehicles
                .Where(v => v.UserId == CurrentUserId)
                .ToListAsync();
            return Ok(userVehicles);
        }

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

        _context.Vehicles.Add(newVehicle);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVehicle), new { id = newVehicle.Id }, newVehicle);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateVehicle(int id, Vehicle updatedVehicle)
    {
        if (id != updatedVehicle.Id)
        {
            return BadRequest("The ID in the URL must match the ID in the data.");
        }

        if (!string.IsNullOrEmpty(CurrentUserId))
        {
            updatedVehicle.UserId = CurrentUserId;
        }

        _context.Entry(updatedVehicle).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.Vehicles.AnyAsync(v => v.Id == id))
            {
                return NotFound("Vehicle not found.");
            }
            throw;
        }

        return NoContent();
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
