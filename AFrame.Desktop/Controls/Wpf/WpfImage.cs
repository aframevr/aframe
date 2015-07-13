using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfImage : WpfControl
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

        public WpfImage()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Image");
        }

        public WpfImage(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Image");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string Alt = "Alt";
        }
    }
}