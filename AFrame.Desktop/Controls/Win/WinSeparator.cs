using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinSeparator : WinControl
    {
        public WinSeparator()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Separator");
        }

        public WinSeparator(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Separator");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
        }
    }
}
