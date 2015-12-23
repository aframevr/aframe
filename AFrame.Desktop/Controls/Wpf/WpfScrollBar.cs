using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfScrollBar : WpfControl
    {
        #region Properties
        public virtual double MaximumPosition
        {
            get
            {
                return (double)base.GetProperty(PropertyNames.MaximumPosition);
            }
        }

        public virtual double MinimumPosition
        {
            get
            {
                return (double)base.GetProperty(PropertyNames.MinimumPosition);
            }
        }

        public virtual string Orientation
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.Orientation);
            }
        }

        public virtual double Position
        {
            get
            {
                return (double)base.GetProperty(PropertyNames.Position);
            }
            set
            {
                this.SetProperty(PropertyNames.Position, (double)value);
            }
        }
        #endregion

        public WpfScrollBar()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "ScrollBar");
        }

        public WpfScrollBar(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "ScrollBar");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string MaximumPosition = "MaximumPosition";
            public static readonly string MinimumPosition = "MinimumPosition";
            public static readonly string Orientation = "Orientation";
            public static readonly string Position = "Position";
        }
    }
}