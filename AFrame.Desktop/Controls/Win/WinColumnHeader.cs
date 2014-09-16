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
        public WinColumnHeader(IContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "ColumnHeader");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
        }
    }
}
