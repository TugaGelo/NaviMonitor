using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NaviMonitor.Api.Models;

namespace NaviMonitor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehicleController : ControllerBase
{
    private readonly AppDbContext _context;

    public VehicleController(AppDbContext context)
    {
        _context = context;
    }

    // GET: /api/vehicle
    [HttpGet]
    public async Task<IActionResult> GetAllVehicles()
    {
        var vehicles = await _context.Vehicles.ToListAsync();
        return Ok(vehicles);
    }

    // GET: /api/vehicle/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetVehicle(int id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);

        if (vehicle == null)
        {
            return NotFound("Vehicle not found in the garage.");
        }

        return Ok(vehicle);
    }

    // POST: /api/vehicle
    [HttpPost]
    public async Task<IActionResult> AddVehicle(Vehicle newVehicle)
    {
        _context.Vehicles.Add(newVehicle);

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVehicle), new { id = newVehicle.Id }, newVehicle);
    }

    // DELETE: /api/vehicle/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVehicle(int id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);

        if (vehicle == null)
        {
            return NotFound("Vehicle not found.");
        }

        _context.Vehicles.Remove(vehicle);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
