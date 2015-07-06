using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfTree : WpfControl
    {
        #region Properties
        public virtual UITestControl HorizontalScrollBar
        {
            get
            {
                return (UITestControl)base.GetProperty(PropertyNames.HorizontalScrollBar);
            }
        }

        public virtual UITestControlCollection Nodes
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.Nodes);
            }
        }

        public virtual UITestControl VerticalScrollBar
        {
            get
            {
                return (UITestControl)base.GetProperty(PropertyNames.VerticalScrollBar);
            }
        }
        #endregion

        public WpfTree(DesktopContext context, DesktopControl parent)
            : base(context, parent)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Tree");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string HorizontalScrollBar = "HorizontalScrollBar";
            public static readonly string Nodes = "Nodes";
            public static readonly string VerticalScrollBar = "VerticalScrollBar";
        }
    }
}