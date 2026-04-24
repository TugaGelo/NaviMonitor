using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace NaviMonitor.Api.Models;

public class Vehicle
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Vehicle Type is required (e.g., Motorcycle, Car).")]
    public string VehicleType { get; set; } = string.Empty;

    [Required(ErrorMessage = "Your vehicle needs a nickname!")]
    [StringLength(50, MinimumLength = 2)]
    public string Nickname { get; set; } = string.Empty;

    [Required]
    public string Make { get; set; } = string.Empty;

    [Required]
    public string Model { get; set; } = string.Empty;

    [Range(1900, 2100)]
    public int Year { get; set; }

    public string Color { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;

    [Range(1, 20000)]
    public int EngineSizeCC { get; set; }

    [Range(0, 1000000)]
    public int StartingOdometer { get; set; }

    public DateTime? RegistrationExpiry { get; set; }
    public DateTime? InsuranceExpiry { get; set; }

    [JsonIgnore]
    public List<RefuelLog> RefuelLogs { get; set; } = new();

    [JsonIgnore]
    public List<MaintenanceLog> MaintenanceLogs { get; set; } = new();
}