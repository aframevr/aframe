using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinRowHeader : WinControl
    {
        #region Properties
        public virtual bool Selected
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Selected);
            }
        }
        #endregion

        public WinRowHeader()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "RowHeader");
        }

        public WinRowHeader(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "RowHeader");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string Selected = "Selected";
        }
    }
}