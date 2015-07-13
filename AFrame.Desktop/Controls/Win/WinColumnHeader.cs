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
        public WinColumnHeader()
        {
            this.SearchProperties.Add(new SearchProperty(WinControl.PropertyNames.ControlType, "ColumnHeader"));
        }

        public WinColumnHeader(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(new SearchProperty(WinControl.PropertyNames.ControlType, "ColumnHeader"));
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
        }
    }
}
