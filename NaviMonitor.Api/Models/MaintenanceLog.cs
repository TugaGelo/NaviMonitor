using System.ComponentModel.DataAnnotations;

namespace NaviMonitor.Api.Models;

public class MaintenanceLog
{
    public int Id { get; set; }

    [Required]
    public int VehicleId { get; set; }

    [Required(ErrorMessage = "A date is required for this service.")]
    public DateTime Date { get; set; }

    [Range(0, 1000000, ErrorMessage = "Odometer reading must be a positive number.")]
    public int Odometer { get; set; }

    [Required(ErrorMessage = "Please specify the service type (e.g., Change Oil).")]
    public string ServiceType { get; set; } = string.Empty;

    [Range(0, 1000000)]
    public double Price { get; set; }

    public bool IsDIY { get; set; }
    public string? ShopName { get; set; }
    public string? MechanicName { get; set; }
    public string? ContactNumber { get; set; }
    public string? Notes { get; set; }

    public int? NextServiceOdometer { get; set; }
    public DateTime? NextServiceDate { get; set; }
    public string? TirePosition { get; set; }

    public Vehicle? Vehicle { get; set; }
}
