using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfRadioButton : WpfControl
    {
        #region Properties
        public virtual UITestControl Group
        {
            get
            {
                return (UITestControl)base.GetProperty(PropertyNames.Group);
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

        public WpfRadioButton()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "RadioButton");
        }

        public WpfRadioButton(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "RadioButton");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string Group = "Group";
            public static readonly string Selected = "Selected";
        }
    }
}