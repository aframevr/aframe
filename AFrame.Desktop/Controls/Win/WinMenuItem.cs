using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinMenuItem : WinControl
    {
        #region Properties
        public virtual string AcceleratorKey
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.AcceleratorKey);
            }
        }

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

        public virtual string DisplayText
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.DisplayText);
            }
        }

        public virtual bool HasChildNodes
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.HasChildNodes);
            }
        }

        public virtual bool IsTopLevelMenu
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.IsTopLevelMenu);
            }
        }

        public virtual UITestControlCollection Items
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.Items);
            }
        }

        public virtual string Shortcut
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.Shortcut);
            }
        }
        #endregion

        public WinMenuItem()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "MenuItem");
        }

        public WinMenuItem(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "MenuItem");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string AcceleratorKey = "AcceleratorKey";
            public static readonly string Checked = "Checked";
            public static readonly string DisplayText = "DisplayText";
            public static readonly string HasChildNodes = "HasChildNodes";
            public static readonly string IsTopLevelMenu = "IsTopLevelMenu";
            public static readonly string Items = "Items";
            public static readonly string Shortcut = "Shortcut";
        }
    }
}
