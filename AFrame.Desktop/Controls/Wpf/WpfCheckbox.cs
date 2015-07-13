using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfCheckbox : WpfControl
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

        public WpfCheckbox()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Checkbox");
        }

        public WpfCheckbox(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Checkbox");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string Checked = "Checked";
            public static readonly string Indeterminate = "Indeterminate";
        }
    }
}