namespace NaviMonitor.Api.Models;

public class RefuelLog
{
    public int Id { get; set; }

    public int VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }

    public DateTime Date { get; set; } = DateTime.Now;

    public int Odometer { get; set; }
    public decimal Volume { get; set; }

    public decimal TotalCost { get; set; }

    public decimal PricePerUnit => Volume > 0 ? TotalCost / Volume : 0;
}
