using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfMenuItem : WpfControl
    {
        #region Properties
        public virtual bool Checked
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Checked);
            }
            set
            {
                this.SetProperty(PropertyNames.Checked, value);
            }
        }

        public virtual bool Expanded
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Expanded);
            }
            set
            {
                this.SetProperty(PropertyNames.Expanded, value);
            }
        }

        public virtual bool HasChildNodes
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.HasChildNodes);
            }
        }

        public virtual string Header
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.Header);
            }
        }

        public virtual bool IsTopLevelMenu
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.IsTopLevelMenu);
            }
        }
        #endregion

        public WpfMenuItem()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "MenuItem");
        }

        public WpfMenuItem(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "MenuItem");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string Checked = "Checked";
            public static readonly string Expanded = "Expanded";
            public static readonly string HasChildNodes = "HasChildNodes";
            public static readonly string Header = "Header";
            public static readonly string IsTopLevelMenu = "IsTopLevelMenu";
        }
    }
}