using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfTabPage : WpfControl
    {
        #region Properties
        public virtual string Header
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.Header);
            }
        }
        #endregion

        public WpfTabPage(IContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "TabPage");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string Header = "Header";
        }
    }
}