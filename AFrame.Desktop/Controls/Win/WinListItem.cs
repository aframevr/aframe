using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinListItem : WinControl
    {
        #region Properties
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

        public WinListItem()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "ListItem");
        }

        public WinListItem(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "ListItem");
        }

        public string[] GetColumnValues()
        {
            return ((Microsoft.VisualStudio.TestTools.UITesting.WinControls.WinListItem)this.RawControl).GetColumnValues();
        }

        public void Select()
        {
            ((Microsoft.VisualStudio.TestTools.UITesting.WinControls.WinListItem)this.RawControl).Select();
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string DisplayText = "DisplayText";
            public static readonly string Selected = "Selected";
        }
    }
}
