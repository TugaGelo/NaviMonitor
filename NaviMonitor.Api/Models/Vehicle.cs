using System.Text.Json.Serialization;

namespace NaviMonitor.Api.Models;

public class Vehicle
{
    public int Id { get; set; }

    public string Nickname { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }

    public int StartingOdometer { get; set; }

    [JsonIgnore]
    public List<RefuelLog> RefuelLogs { get; set; } = new();
}
