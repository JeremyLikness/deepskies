namespace DeepSkies.Model
{
    /// <summary>
    /// Represent right ascension in a class with properties for hour, minute, second, and degrees.
    /// </summary>
    public class RightAscension
    {
        private double degrees;
        private int hour, minute;
        private double second;

        public RightAscension(int hour, int minute, double second)
        {
            Hour = hour;
            Minute = minute;
            Second = second;
            Convert();
        }

        public RightAscension(double degrees)
        {
            Degrees = degrees;
            Convert(true);
        }   

        public RightAscension(string ra)
        {
            string[] parts = ra.Split(' ');
            if (parts.Length != 3)
                throw new ArgumentException("Right ascension must be in the format 'hh mm ss.s'");
            hour = int.Parse(parts[0].TrimEnd('h'));
            minute = int.Parse(parts[1].TrimEnd('m'));
            second = double.Parse(parts[2].TrimEnd('s'));
            Convert();
        }

        public int Hour
        {
            get => hour;
            set
            {
                if (value < 0 || value > 23)
                {
                    throw new ArgumentOutOfRangeException("Hour must be between 0 and 23");
                }

                hour = value;
                Convert();
            }
        }

        public int Minute
        {
            get => minute;
            set
            {
                if (value < 0 || value > 59)
                {
                    throw new ArgumentOutOfRangeException("Minute must be between 0 and 59");
                }

                minute = value;
                Convert();
            }
        }

        public double Second 
        {
            get => second; 
            set
            {
                if (value < 0 || value > 59)
                {
                    throw new ArgumentOutOfRangeException("Second must be between 0 and 59");
                }

                second = value;
                Convert();
            }
        }

        public double Degrees
        {
            get => degrees;
            set
            {
                if (value < 0 || value > 360)
                {
                    throw new ArgumentOutOfRangeException("Degrees must be between 0 and 360");
                }

                degrees = value;
                Convert(true);
            }
        }

        private void Convert(bool degreesToHours = false)
        {
            if (degreesToHours)
            {
                var dec = degrees / 15;
                hour = (int)dec;
                minute = (int)((dec - hour) * 60);
                second = (((dec - hour) * 60 - minute) * 60);
            }
            else
            {
                var secs = (hour * 60 * 60) + (minute * 60) + second; 
                degrees = secs * 0.00416666666667;
            }
        }

        public override string ToString() => $"{hour}h {minute}m {second}s";
    }   
}
