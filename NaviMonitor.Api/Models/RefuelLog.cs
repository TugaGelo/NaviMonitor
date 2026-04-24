using System.ComponentModel.DataAnnotations;

namespace NaviMonitor.Api.Models;

public class RefuelLog
{
    public int Id { get; set; }

    [Required]
    public int VehicleId { get; set; }

    [Required(ErrorMessage = "A date is required for this log.")]
    public DateTime Date { get; set; }

    [Range(0, 1000000, ErrorMessage = "Odometer reading must be a positive number.")]
    public int Odometer { get; set; }

    [Range(0.1, 500, ErrorMessage = "Volume must be between 0.1 and 500 liters.")]
    public double Volume { get; set; }

    [Range(0.01, 10000, ErrorMessage = "Total cost must be greater than zero.")]
    public double TotalCost { get; set; }

    public Vehicle? Vehicle { get; set; }
}
