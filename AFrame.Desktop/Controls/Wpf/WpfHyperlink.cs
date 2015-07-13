using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfHyperlink : WpfControl
    {
        #region Properties
        public virtual string Alt
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.Alt);
            }
        }
        #endregion

        public WpfHyperlink()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Hyperlink");
        }

        public WpfHyperlink(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Hyperlink");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string Alt = "Alt";
        }
    }
}