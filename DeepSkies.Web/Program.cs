using DeepSkies.Model;
using DeepSkies.Web;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSqlite<DeepSkyContext>(
    builder.Configuration.GetConnectionString("DeepSkies"));
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();

app.MapGet("/hello", () => "world");
app.MapGroup("/data").MapDeepSkyData();

app.Run();
