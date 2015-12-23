using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfListItem : WpfControl
    {
        #region Properties
        public void Select()
        {
            var ctrl = (Microsoft.VisualStudio.TestTools.UITesting.WpfControls.WpfListItem)this.RawControl;
            ctrl.Select();
        }

        public virtual string DisplayText
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.DisplayText);
            }
        }

        public virtual bool Selected
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Selected);
            }
        }
        #endregion

        public WpfListItem()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "ListItem");
        }

        public WpfListItem(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "ListItem");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string DisplayText = "DisplayText";
            public static readonly string Selected = "Selected";
        }
    }
}