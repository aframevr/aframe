using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinTree : WinControl
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

        public WinTree()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Tree");
        }

        public WinTree(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Tree");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string HorizontalScrollBar = "HorizontalScrollBar";
            public static readonly string Nodes = "Nodes";
            public static readonly string VerticalScrollBar = "VerticalScrollBar";
        }
    }
}