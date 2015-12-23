using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfExpander : WpfControl
    {
        #region Properties
        public virtual bool Expanded
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Expanded);
            }
            set
            {
                this.SetProperty(PropertyNames.Expanded, value);
            }
        }

        public virtual string Header
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.Header);
            }
        }
        #endregion

        public WpfExpander()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Expander");
        }

        public WpfExpander(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Expander");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string Expanded = "Expanded";
            public static readonly string Header = "Header";
        }
    }
}