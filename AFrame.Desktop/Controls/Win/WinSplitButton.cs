using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinSplitButton : WinControl
    {
        public WinSplitButton()
        {
            this.SearchProperties.Add(new SearchProperty(WinControl.PropertyNames.ControlType, "SplitButton"));
        }

        public WinSplitButton(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(new SearchProperty(WinControl.PropertyNames.ControlType, "SplitButton"));
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
        }
    }
}
