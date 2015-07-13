using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinButton : WinControl
    {
        #region Properties
        public virtual string DisplayText
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.DisplayText);
            }
        }

        public virtual string Shortcut
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.Shortcut);
            }
        }
        #endregion

        public WinButton()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Button");
        }

        public WinButton(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Button");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string DisplayText = "DisplayText";
            public static readonly string Shortcut = "Shortcut";
        }
    }
}