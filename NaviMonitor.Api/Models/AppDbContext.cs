using Microsoft.EntityFrameworkCore;

namespace NaviMonitor.Api.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<RefuelLog> RefuelLogs { get; set; }
}
