using MainFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Desktop.Controls.Wpf
{
    public class WpfText : WpfControl
    {
        public WpfText(IContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Text");
        }

        public virtual string DisplayText
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.DisplayText);
            }
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string DisplayText = "DisplayText";
        }
    }
}
