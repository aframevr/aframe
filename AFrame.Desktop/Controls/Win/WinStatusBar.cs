using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinStatusBar : WinControl
    {
        #region Properties
        public virtual UITestControlCollection Panels
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.Panels);
            }
        }
        #endregion

        public WinStatusBar()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "StatusBar");
        }

        public WinStatusBar(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "StatusBar");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string Panels = "Panels";
        }
    }
}