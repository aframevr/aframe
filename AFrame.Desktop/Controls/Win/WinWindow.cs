using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinWindow : WinControl
    {
        #region Properties
        public bool AlwaysOnTop
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.AlwaysOnTop);
            }
        }

        public bool HasTitleBar
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.HasTitleBar);
            }
        }

        public bool Maximized
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Maximized);
            }
            set
            {
                this.SetProperty(PropertyNames.Maximized, value);
            }
        }

        public bool Minimized
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Minimized);
            }
            set
            {
                this.SetProperty(PropertyNames.Minimized, value);
            }
        }

        public int OrderOfInvocation
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.OrderOfInvocation);
            }
        }

        public bool Popup
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Popup);
            }
        }

        public bool Resizable
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Resizable);
            }
        }

        public bool Restored
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Restored);
            }
            set
            {
                this.SetProperty(PropertyNames.Restored, value);
            }
        }

        public bool ShowInTaskbar
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.ShowInTaskbar);
            }
        }

        public bool TabStop
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.TabStop);
            }
        }

        public bool Transparent
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Transparent);
            }
        }
        #endregion

        public WinWindow()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Window");
        }

        public WinWindow(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Window");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string AccessibleName = "AccessibleName";
            public static readonly string AlwaysOnTop = "AlwaysOnTop";
            public static readonly string HasTitleBar = "HasTitleBar";
            public static readonly string Maximized = "Maximized";
            public static readonly string Minimized = "Minimized";
            public static readonly string OrderOfInvocation = "OrderOfInvocation";
            public static readonly string Popup = "Popup";
            public static readonly string Resizable = "Resizable";
            public static readonly string Restored = "Restored";
            public static readonly string ShowInTaskbar = "ShowInTaskbar";
            public static readonly string TabStop = "TabStop";
            public static readonly string Transparent = "Transparent";
        }
    }
}