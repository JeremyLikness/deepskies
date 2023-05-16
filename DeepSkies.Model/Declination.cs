namespace DeepSkies.Model
{
    // represent astronomical declination in a class
    // degrees is always positive, dec is a positive or negative value
    public class Declination
    {
        private int degrees, arcMinutes;
        private double arcSeconds, dec;

        private bool isNegative;

        public Declination(bool isNegative, int degrees, int arcMinutes, double arcSeconds)
        {
            this.isNegative = isNegative;
            this.degrees = degrees;
            this.arcMinutes = arcMinutes;
            this.arcSeconds = arcSeconds;
            Convert();
        }

        public Declination(double dec)
        {
            this.dec = dec;
            Convert(true);
        }

        public Declination(string dec)
        {
            var parts = dec.Split(' ');
            isNegative = false;
            
            while (parts[0].StartsWith('-' ) || parts[0].StartsWith('+'))
            {
                isNegative = parts[0].StartsWith('-');
                parts[0] = parts[0].Substring(1);
            }
            
            if (parts.Length != 3)
            {
                throw new ArgumentException("Declination must be in the format of 'DD MM SS.SSS'");
            }
            degrees = int.Parse(parts[0].TrimEnd('°'));
            arcMinutes = int.Parse(parts[1].TrimEnd('\''));
            arcSeconds = double.Parse(parts[2].TrimEnd('\''));
            Convert();
        }

        public bool IsNegative 
        { 
            get => isNegative; 
            set
            {
                if (isNegative != value)
                {
                    isNegative = value;
                    dec *= -1;
                    Convert(true);
                }
            }
        }
        public int Degrees 
        {
            get => degrees; 
            set
            {
                if (value < 0 || value > 90)
                {
                    throw new ArgumentException("Degrees must be between 0 and 90.");
                }
                degrees = value;
                Convert();
            }
        }
        public int ArcMinutes 
        { 
            get => arcMinutes; 
            set
            {
                if (value < 0 || value > 59)
                {
                    throw new ArgumentException("ArcMinutes must be between 0 and 59.");
                }
                arcMinutes = value;
                Convert();
            }
        }

        public double ArcSeconds 
        { 
            get => arcSeconds;
            set
            {
                if (value < 0 || value >= 60)
                {
                    throw new ArgumentException("ArcSeconds must be between 0 and 59.");
                }
                arcSeconds = value;
                Convert();
            }
        }

        public double Dec
        {
            get => dec;
            set
            {
                if (value < -90 || value > 90)
                {
                    throw new ArgumentException("Declination must be between -90 and 90.");
                }
                dec = value;
                isNegative = dec < 0;
                Convert(true);
            }
        }

        private void Convert(bool fromDec = false)
        {
            if (fromDec)
            {
                isNegative = dec < 0;
                var absDec = Math.Abs(dec);
                degrees = (int)absDec;
                arcMinutes = (int)((absDec - degrees) * 60);
                arcSeconds = ((absDec - degrees) * 60 - arcMinutes) * 60.0;                
            }
            else
            {
                dec = degrees + arcMinutes / 60.0 + arcSeconds / 3600.0;
                
                if (isNegative)
                {
                    dec *= -1;
                }
            }
        }

        public override string ToString() => $"{(IsNegative ? "-" : "+")}{Degrees}° {ArcMinutes}' {ArcSeconds}''";        
    }
}
