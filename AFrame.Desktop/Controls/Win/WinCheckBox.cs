using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinCheckBox : WinControl
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

        public virtual bool Indeterminate
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Indeterminate);
            }
            set
            {
                this.SetProperty(PropertyNames.Indeterminate, value);
            }
        }
        #endregion

        public WinCheckBox()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "CheckBox");
        }

        public WinCheckBox(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "CheckBox");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string Checked = "Checked";
            public static readonly string Indeterminate = "Indeterminate";
        }
    }
}
