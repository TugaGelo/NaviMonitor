using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace NaviMonitor.Api.Models;

public class RefuelLog
{
    public int Id { get; set; }

    [Required]
    public int VehicleId { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public int Odometer { get; set; }

    [Required]
    public double Volume { get; set; }

    [Required]
    public double TotalCost { get; set; }

    public string FuelType { get; set; } = "Unleaded";

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public Vehicle? Vehicle { get; set; }
}
