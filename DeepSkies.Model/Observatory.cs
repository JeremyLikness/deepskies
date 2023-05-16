using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DeepSkies.Model
{
    public class Observatory
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public Exhibit Observation { get; set; } = null!;
        public string LocationLink { get; set; } = null!;   
    }
}
