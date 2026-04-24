namespace NaviMonitor.Api.Models;

public enum DistanceUnit { Kilometers, Miles }
public enum VolumeUnit { Liters, Gallons }

public class Vehicle
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public DistanceUnit DistanceUnit { get; set; } = DistanceUnit.Kilometers;
    public VolumeUnit VolumeUnit { get; set; } = VolumeUnit.Liters;

    public ICollection<RefuelLog> RefuelLogs { get; set; } = new List<RefuelLog>();
}
