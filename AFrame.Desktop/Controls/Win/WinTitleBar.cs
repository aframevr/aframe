using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinTitleBar : WinControl
    {
        #region Properties
        public virtual string DisplayText
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.DisplayText);
            }
        }
        #endregion

        public WinTitleBar(DesktopContext context, DesktopControl parent)
            : base(context, parent)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "TitleBar");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string DisplayText = "DisplayText";
        }
    }
}
