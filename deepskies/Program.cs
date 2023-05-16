using DeepSkies.Model;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

const char done = '\u2713';

Console.WriteLine("Deep Skies setup.");

Console.WriteLine(".*. 1. Create local database.");
Console.WriteLine("... 2. Download remote database.");
Console.WriteLine("... 3. Parse remote database.");
Console.WriteLine("... 4. Populate local database.");
Console.WriteLine("Status: Creating local database...");
Console.WriteLine();
Console.WriteLine();

var status = Console.GetCursorPosition().Top - 7;

using var context = new DeepSkyContext(
    new DbContextOptionsBuilder<DeepSkyContext>()
    .UseSqlite($"Data Source=./gallery.sqlite3").Options);

context.Database.EnsureDeleted();
context.Database.EnsureCreated();

Console.SetCursorPosition(1, status);
Console.Write(done);
Console.SetCursorPosition(1, status+1);
Console.Write('*');
Console.SetCursorPosition(8, status + 4);
Console.Write("Downloading remote database...");

var database = await new HttpClient().GetStringAsync("https://deepskyworkflows.com/gallery-database.json");

Console.SetCursorPosition(1, status + 1);
Console.Write(done);
Console.SetCursorPosition(1, status + 2);
Console.Write('*');
Console.SetCursorPosition(8, status + 4);
Console.Write("Parsing the database...        ");

var exhibits = JsonDocument.Parse(database);
var gallery = exhibits.RootElement.GetProperty("gallery");

List<Exhibit> exhibitDb = new();
List<TargetType> targetTypes = new();
List<Telescope> telescopes = new();
List<Tag> tags = new();

var spinner = "/-\\|";
var spinnerIndex = 0;

var jGetString = (JsonElement element, string property) =>
    element.TryGetProperty(property, out JsonElement value) ? value.GetString()! : string.Empty;

var jGetBool = (JsonElement element, string property) =>
    element.TryGetProperty(property, out JsonElement value) ? value.GetString() == "true" : false;

foreach (JsonElement jsonExhibit in gallery.EnumerateArray())
{
    Console.SetCursorPosition(1, status + 2);
    Console.Write(spinner[spinnerIndex++ % spinner.Length]);

    var folder = jGetString(jsonExhibit, "folder");

    if (string.IsNullOrWhiteSpace(folder))
    {
        continue;
    }

    var typeName = jsonExhibit.GetProperty("type").GetString()!;
    
    var newTarget = targetTypes.SingleOrDefault(t => t.Name == typeName) ?? new TargetType { Name = typeName };
    
    if (!targetTypes.Contains(newTarget))
    {
        targetTypes.Add(newTarget);
    }

    var title = jsonExhibit.GetProperty("title").GetString()!;
    var description = jsonExhibit.GetProperty("description").GetString()!;
    var thumb = jsonExhibit.GetProperty("thumbnailUrl").GetString()!;
    var image = jsonExhibit.GetProperty("imageUrl").GetString()!;

    var scopeName = jsonExhibit.GetProperty("telescope").GetString()!;
    
    var scope = telescopes.SingleOrDefault(t => t.Name == scopeName) ?? new Telescope { Name = scopeName };
    
    if (!telescopes.Contains(scope))
    {
        telescopes.Add(scope);
    }

    RightAscension? ra = null;
    Declination? dec = null;
    string size = string.Empty;
    string radius = string.Empty;
    string scale = string.Empty;
    bool annotated = false;

    if (jsonExhibit.TryGetProperty("rightAscension", out JsonElement raElem))
    {
        ra = new RightAscension(raElem.GetString()!);
        dec = new Declination(jsonExhibit.GetProperty("declination").ToString()!);
        size = jsonExhibit.GetProperty("size").GetString() ?? string.Empty;
        radius = jsonExhibit.GetProperty("radius").GetString() ?? string.Empty;
        scale = jsonExhibit.GetProperty("scale").GetString() ?? string.Empty;
        annotated = true;
    };

    bool signature = jGetBool(jsonExhibit, nameof(signature));
    bool archive = jGetBool(jsonExhibit, nameof(archive));
    bool noStars = jGetBool(jsonExhibit, nameof(noStars).ToLower());

    var exhibitTags = new List<Tag>();

    if (jsonExhibit.TryGetProperty("tags", out JsonElement tagList))
    {
        foreach (var tagElement in tagList.EnumerateArray())
        {
            var tagName = tagElement.GetString()!;
            var tag = tags
                .SingleOrDefault(tag => tag.Name == tagName) 
                ?? new Tag{ Name = tagName };
            
            if (!tags.Contains(tag))
            {
                tags.Add(tag);
            }
            
            exhibitTags.Add(tag);
        }
    }

    var focalLength = double.Parse(jsonExhibit.GetProperty("focalLength").GetString()!.TrimEnd('m'));
    var aperture = double.Parse(jsonExhibit.GetProperty("aperture").GetString()!.TrimEnd('m'));
    var exposure = double.TryParse(jsonExhibit.GetProperty("exposure").GetString()!.TrimEnd('s'), out double result)
        ? result : 0;
    var lights = int.TryParse(jsonExhibit.GetProperty("lights").GetString(), out int lightResult)
        ? lightResult : 1;
    var sessions = int.TryParse(jsonExhibit.GetProperty("sessions").GetString(), out int sessionResult)
        ? sessionResult : 1;
    var firstCapture = DateTime.Parse(jsonExhibit.GetProperty("firstCapture").GetString()!);
    var lastCapture = DateTime.Parse(jsonExhibit.GetProperty("lastCapture").GetString()!);

    var exhibit = new Exhibit
    {
        Folder = folder,
        Type = newTarget.Name,
        Title = title,
        Description = description,
        ThumbnailUrl = thumb,
        ImageUrl = image,
        Scope = scope.Name,
        FocalLength = focalLength,
        Aperture = aperture,
        Exposure = exposure,
        Lights = lights,
        Sessions = sessions,
        FirstCapture = firstCapture,
        LastCapture = lastCapture,
        RA = ra,
        Dec = dec,
        Size = size,
        Radius = radius,
        Scale = scale,
        Annotated = annotated,
        Archive = archive,
        NoStars = noStars,
        Signature = signature,
        Tags = exhibitTags
    };

    exhibitDb.Add(exhibit);    
}

Console.SetCursorPosition(1, status + 2);
Console.Write(done);
Console.SetCursorPosition(1, status + 3);
Console.Write('*');
Console.SetCursorPosition(8, status + 4);
Console.Write("Writing to the local database...");
Console.SetCursorPosition(0, status + 5);

Console.WriteLine($"{exhibitDb.Count} exhibits, {targetTypes.Count} types, {telescopes.Count} scopes and {tags.Count} tags parsed.");

context.Exhibits.AddRange(exhibitDb);
context.TargetTypes.AddRange(targetTypes);
context.Telescopes.AddRange(telescopes);
context.SaveChanges();

Console.SetCursorPosition(1, status + 3);
Console.Write(done);
Console.SetCursorPosition(8, status + 4);
Console.Write("Setup is complete. Be sure to copy your SQLite database file to the web app!");
Console.SetCursorPosition(8, status + 6);
Console.WriteLine();
