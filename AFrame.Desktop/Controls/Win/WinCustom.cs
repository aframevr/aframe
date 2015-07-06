using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinCustom : WinControl
    {
        public WinCustom(DesktopContext context, DesktopControl parent)
            : base(context, parent)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Custom");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
        }
    }
}
