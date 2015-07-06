using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinGroup : WinControl
    {
        public WinGroup(DesktopContext context, DesktopControl parent)
            : base(context, parent)
        {
            this.SearchProperties.Add(new SearchProperty(WinControl.PropertyNames.ControlType, "Group"));
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
        }
    }
}
