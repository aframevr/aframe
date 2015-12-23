using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinSpinner : WinControl
    {
        #region Properties
        public virtual int MaximumValue
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.MaximumValue);
            }
        }

        public virtual int MinimumValue
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.MinimumValue);
            }
        }
        #endregion

        public WinSpinner()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Spinner");
        }

        public WinSpinner(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Spinner");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string MaximumValue = "MaximumValue";
            public static readonly string MinimumValue = "MinimumValue";
        }
    }
}
