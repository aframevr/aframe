using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfMenu : WpfControl
    {
        #region Properties
        public virtual UITestControlCollection Items
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.Items);
            }
        }
        #endregion

        public WpfMenu()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Menu");
        }

        public WpfMenu(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Menu");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string Items = "Items";
        }
    }
}