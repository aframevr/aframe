using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Core
{
    public static class Playback
    {
        /// <summary>
        /// How long to keep searching for the control before it gives up. Default is 15 seconds.
        /// </summary>
        public static int SearchTimeout { get; set; }

        /// <summary>
        /// If true, the framework will highlight the control after it is found.
        /// </summary>
        public static bool HighlightOnFind { get; set; }

        /// <summary>
        /// If true, any access of the control will cause the control to be found again. Effectively
        /// never caching the control.
        /// 
        /// Note: This significantly slows down execution, implementing it control by 
        ///       control maybe a better solution.
        /// </summary>
        public static bool AlwaysSearch { get; set; }

        public static Dictionary<string, object> Properties { get; set; }

        static Playback()
        {
            SearchTimeout = 15 * 1000;
            HighlightOnFind = true;
            AlwaysSearch = false;
            Properties = new Dictionary<string, object>();
        }
    }
}