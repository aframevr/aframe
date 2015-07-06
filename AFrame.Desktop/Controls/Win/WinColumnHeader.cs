using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinColumnHeader : WinControl
    {
        public WinColumnHeader(DesktopContext context, DesktopControl parent)
            : base(context, parent)
        {
            this.SearchProperties.Add(new SearchProperty(WinControl.PropertyNames.ControlType, "ColumnHeader"));
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
        }
    }
}
