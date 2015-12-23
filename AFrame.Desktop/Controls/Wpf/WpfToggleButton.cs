using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfToggleButton : WpfControl
    {
        #region Properties
        public virtual string DisplayText
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.DisplayText);
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

        public virtual bool Pressed
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Pressed);
            }
            set
            {
                this.SetProperty(PropertyNames.Pressed, value);
            }
        }
        #endregion

        public WpfToggleButton()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "ToggleButton");
        }

        public WpfToggleButton(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "ToggleButton");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string DisplayText = "DisplayText";
            public static readonly string Indeterminate = "Indeterminate";
            public static readonly string Pressed = "Pressed";
        }
    }
}