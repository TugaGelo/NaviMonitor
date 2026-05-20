using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace NaviMonitor.Api.Models;

public class MaintenanceLog
{
    public int Id { get; set; }

    [Required]
    public int VehicleId { get; set; }

    [Required]
    public string LogType { get; set; } = "Maintenance";

    public string? ServiceCategory { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public int Odometer { get; set; }

    [Required]
    public string ServiceType { get; set; } = string.Empty;

    [Required]
    public double Price { get; set; }

    public bool IsDIY { get; set; } = false;

    public string? ShopName { get; set; }
    public string? MechanicName { get; set; }
    public string? ContactNumber { get; set; }
    public string? Notes { get; set; }

    public int? NextServiceOdometer { get; set; }
    public DateTime? NextServiceDate { get; set; }
    public string? TirePosition { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public Vehicle? Vehicle { get; set; }
}
