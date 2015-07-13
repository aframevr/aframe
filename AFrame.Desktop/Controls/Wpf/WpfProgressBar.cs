using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfProgressBar : WpfControl
    {
        #region Properties
        public virtual double MaximumValue
        {
            get
            {
                return (double)base.GetProperty(PropertyNames.MaximumValue);
            }
        }

        public virtual double MinimumValue
        {
            get
            {
                return (double)base.GetProperty(PropertyNames.MinimumValue);
            }
        }

        public virtual double Position
        {
            get
            {
                return (double)base.GetProperty(PropertyNames.Position);
            }
        }
        #endregion

        public WpfProgressBar()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "ProgressBar");
        }

        public WpfProgressBar(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "ProgressBar");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string MaximumValue = "MaximumValue";
            public static readonly string MinimumValue = "MinimumValue";
            public static readonly string Position = "Position";
        }
    }
}