using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinRadioButton : WinControl
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

        public WinRadioButton()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "RadioButton");
        }

        public WinRadioButton(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "RadioButton");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string Group = "Group";
            public static readonly string Selected = "Selected";
        }
    }
}