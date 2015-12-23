using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinPane : WinControl
    {
        public WinPane()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Pane");
        }

        public WinPane(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Pane");
        }

        public new class PropertyNames : WinControl.PropertyNames
        { }
    }
}
