using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfStatusBar : WpfControl
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

        public WpfStatusBar(DesktopContext context, DesktopControl parent)
            : base(context, parent)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "StatusBar");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string Panels = "Panels";
        }
    }
}