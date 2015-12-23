using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfPane : WpfControl
    {
        public WpfPane()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Pane");
        }

        public WpfPane(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Pane");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string HorizontalScrollBar = "HorizontalScrollBar";
            public static readonly string VerticalScrollBar = "VerticalScrollBar";
        }
    }
}