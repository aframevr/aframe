using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfToolBar : WpfControl
    {
        #region Properties
        public virtual string Header
        {
            get
            {
                return (string)((string)base.GetProperty(PropertyNames.Header));
            }
        }

        public virtual UITestControlCollection Items
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.Items);
            }
        }
        #endregion

        public WpfToolBar()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "ToolBar");
        }

        public WpfToolBar(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "ToolBar");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string Header = "Header";
            public static readonly string Items = "Items";
        }
    }
}