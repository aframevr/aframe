using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfTabList : WpfControl
    {
        #region Properties
        public virtual int SelectedIndex
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.SelectedIndex);
            }
            set
            {
                this.SetProperty(PropertyNames.SelectedIndex, value);
            }
        }

        public virtual UITestControlCollection Tabs
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.Tabs);
            }
        }
        #endregion

        public WpfTabList()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "TabList");
        }

        public WpfTabList(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "TabList");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string SelectedIndex = "SelectedIndex";
            public static readonly string Tabs = "Tabs";
        }
    }
}