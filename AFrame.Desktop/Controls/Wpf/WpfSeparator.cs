using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfSeparator : WpfControl
    {
        public WpfSeparator(DesktopContext context, DesktopControl parent)
            : base(context, parent)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Separator");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {

        }
    }
}