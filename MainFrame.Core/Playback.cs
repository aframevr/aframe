using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Core
{
    public static class Playback
    {
        public static int SearchTimeout { get; set; }

        public static bool HighlightOnFind { get; set; }

        public static Dictionary<string, object> Properties { get; set; }

        static Playback()
        {
            SearchTimeout = 15 * 1000;
            HighlightOnFind = true;
            Properties = new Dictionary<string, object>();
        }
    }
}
