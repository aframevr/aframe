using MainFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Desktop.Controls.Wpf
{
    public class WpfButton : WpfControl
    {
        public WpfButton(IContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Button");
        }

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

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string DisplayText = "DisplayText";
            public static readonly string Shortcut = "Shortcut";
        }
    }
}