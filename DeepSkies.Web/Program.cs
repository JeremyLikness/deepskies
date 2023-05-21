using DeepSkies.Model;
using DeepSkies.Web;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

using var connection = new SqliteConnection("DataSource=:memory:");
connection.Open();

builder.Services.AddAuthorization();

builder.Services.AddDbContext<DeepSkyUserContext>(opt => opt.UseSqlite(connection));

builder.Services.AddIdentityApiEndpoints<IdentityUser>()
    .AddEntityFrameworkStores<DeepSkyUserContext>();

builder.Services.AddSqlite<DeepSkyContext>(
    builder.Configuration.GetConnectionString("DeepSkies"));

builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();

app.MapGet("/hello", () => "world");
app.MapGroup("/data").MapDeepSkyData();
app.MapGroup("/personaldata").MapDeepSkyPersonalData();

app.MapGroup("/identity").MapIdentityApi<IdentityUser>();

app.Run();

public class DeepSkyUserContext : IdentityDbContext<IdentityUser>
{
    public DeepSkyUserContext(DbContextOptions<DeepSkyUserContext> options) : base(options)
    {
        Database.EnsureCreated();
    }
}