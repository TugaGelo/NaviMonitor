using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NaviMonitor.Api.Models;
using System.Security.Claims;
using System.Text.Json;

namespace NaviMonitor.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SettingsController(AppDbContext context)
    {
        _context = context;
    }

    private string CurrentUserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _context.UserSettings.FindAsync(CurrentUserId);

        if (settings == null)
        {
            settings = new UserSettings
            {
                UserId = CurrentUserId,
                FuelTypesJson = JsonSerializer.Serialize(new List<string> { "Unleaded", "Premium", "Diesel" }),
                ServiceTypesJson = JsonSerializer.Serialize(new List<string> { "Oil Change", "Tire Rotation", "Brake Inspection", "Battery Replacement" })
            };

            _context.UserSettings.Add(settings);
            await _context.SaveChangesAsync();
        }

        return Ok(settings);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSettings(UserSettings updatedSettings)
    {
        if (CurrentUserId != updatedSettings.UserId)
        {
            return Forbid();
        }

        _context.Entry(updatedSettings).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return Ok(updatedSettings);
    }
}
