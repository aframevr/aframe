using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinToolBar : WinControl
    {
        #region Properties
        public virtual UITestControlCollection Items
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.Items);
            }
        }
        #endregion

        public WinToolBar(IContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "ToolBar");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string Items = "Items";
        }
    }
}
