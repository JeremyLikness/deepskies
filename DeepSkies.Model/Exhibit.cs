using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DeepSkies.Model
{
    // convert record to class
    public class Tag
    {
        [Key]
        public string Name { get; set; } = null!;
    }

    public class TargetType
    {
        [Key]
        public string Name { get; set; } = null!;
    }

    public class Telescope
    {
        [Key]
        public string Name { get; set; } = null!;
    }

    /// <summary>
    /// See https://deepskyworkflows.com/gallery-database.json for the template
    /// </summary>
    public class Exhibit
    {
        [Key]
        public string Folder { get; set; } = null!;
        [ForeignKey(nameof(TargetType))]
        public string Type { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string ThumbnailUrl { get; set; } = null!;
        public string ImageUrl { get; set; } = null!;
        [ForeignKey(nameof(Telescope))]
        public string Scope { get; set; } = null!;
        public double FocalLength { get; set; }
        public double Aperture { get; set; }
        public double Exposure { get; set; }
        public int Lights { get; set; }
        public int Sessions { get; set; }
        public DateTime FirstCapture { get; set; } = DateTime.MinValue;
        public DateTime LastCapture { get; set; } = DateTime.MinValue;
        public RightAscension? RA { get; set; }
        public Declination? Dec { get; set; }
        public string Size { get; set; } = null!;
        public string Radius { get; set; } = null!;
        public string Scale { get; set; } = null!;
        public bool Annotated { get; set; }
        public bool Archive { get; set; }
        public bool NoStars { get; set; }
        public bool Signature { get; set; }
        public List<Tag> Tags { get; set; } = new List<Tag>();
    }
}