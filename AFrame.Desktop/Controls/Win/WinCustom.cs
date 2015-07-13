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
        public WinCustom()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Custom");
        }

        public WinCustom(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Custom");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
        }
    }
}
