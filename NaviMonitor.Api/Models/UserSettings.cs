using System.ComponentModel.DataAnnotations;

namespace NaviMonitor.Api.Models;

public class UserSettings
{
    [Key]
    public string UserId { get; set; } = string.Empty;

    public string DistanceUnit { get; set; } = "km";
    public string VolumeUnit { get; set; } = "L";
    public string Currency { get; set; } = "PHP";

    public string FuelTypesJson { get; set; } = "[]";
    public string ServiceTypesJson { get; set; } = "[]";
}
