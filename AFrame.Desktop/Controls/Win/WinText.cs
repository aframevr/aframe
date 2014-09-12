using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinText : WinControl
    {
        public WinText(IContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Text");
        }

        public virtual string DisplayText
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.DisplayText);
            }
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string DisplayText = "DisplayText";
        }
    }
}
