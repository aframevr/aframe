using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinToolTip : WinControl
    {
        public WinToolTip(DesktopContext context, DesktopControl parent)
            : base(context, parent)
        {
            this.SearchProperties.Add(new SearchProperty(WinControl.PropertyNames.ControlType, "ToolTip"));
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
        }
    }
}
