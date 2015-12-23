using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinTabList : WinControl
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

        public virtual UITestControl TabSpinner
        {
            get
            {
                return (UITestControl)base.GetProperty(PropertyNames.TabSpinner);
            }
        }
        #endregion

        public WinTabList()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "TabList");
        }

        public WinTabList(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "TabList");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string SelectedIndex = "SelectedIndex";
            public static readonly string Tabs = "Tabs";
            public static readonly string TabSpinner = "TabSpinner";
        }
    }
}
