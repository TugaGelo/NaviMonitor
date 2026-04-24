using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace NaviMonitor.Api.Models;

public class Vehicle
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Your bike needs a nickname!")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Nickname must be between 2 and 50 characters.")]
    public string Nickname { get; set; } = string.Empty;

    [Required(ErrorMessage = "Make is required (e.g., Honda).")]
    public string Make { get; set; } = string.Empty;

    [Required(ErrorMessage = "Model is required (e.g., Navi).")]
    public string Model { get; set; } = string.Empty;

    [Range(1900, 2100, ErrorMessage = "Please enter a valid year.")]
    public int Year { get; set; }

    [Range(0, 1000000, ErrorMessage = "Starting odometer cannot be a negative number.")]
    public int StartingOdometer { get; set; }

    [JsonIgnore]
    public List<RefuelLog> RefuelLogs { get; set; } = new();
}
