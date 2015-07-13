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
        public WinGroup()
        {
            this.SearchProperties.Add(new SearchProperty(WinControl.PropertyNames.ControlType, "Group"));
        }

        public WinGroup(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(new SearchProperty(WinControl.PropertyNames.ControlType, "Group"));
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
        }
    }
}
