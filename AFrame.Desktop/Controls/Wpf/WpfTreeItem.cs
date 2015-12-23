using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfTreeItem : WpfControl
    {
        #region Properties
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

        public virtual UITestControlCollection Nodes
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.Nodes);
            }
        }

        public virtual UITestControl ParentNode
        {
            get
            {
                return (UITestControl)base.GetProperty(PropertyNames.ParentNode);
            }
        }

        public virtual bool Selected
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Selected);
            }
            set
            {
                this.SetProperty(PropertyNames.Selected, value);
            }
        }
        #endregion

        public WpfTreeItem()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "TreeItem");
        }

        public WpfTreeItem(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "TreeItem");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string Expanded = "Expanded";
            public static readonly string HasChildNodes = "HasChildNodes";
            public static readonly string Header = "Header";
            public static readonly string Nodes = "Nodes";
            public static readonly string ParentNode = "ParentNode";
            public static readonly string Selected = "Selected";
        }
    }
}