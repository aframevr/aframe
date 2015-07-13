using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfTitleBar : WpfControl
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

        public WpfTitleBar()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "TitleBar");
        }

        public WpfTitleBar(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "TitleBar");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string DisplayText = "DisplayText";
        }
    }
}