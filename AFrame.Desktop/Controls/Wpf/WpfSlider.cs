using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfSlider : WpfControl
    {
        #region Properties
        public virtual double LargeChange
        {
            get
            {
                return (double)base.GetProperty(PropertyNames.LargeChange);
            }
        }

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

        public virtual double Position
        {
            get
            {
                return (double)base.GetProperty(PropertyNames.Position);
            }
            set
            {
                this.SetProperty(PropertyNames.Position, value);
            }
        }

        public virtual string PositionAsString
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.PositionAsString);
            }
            set
            {
                this.SetProperty(PropertyNames.PositionAsString, value);
            }
        }

        public virtual double SmallChange
        {
            get
            {
                return (double)base.GetProperty(PropertyNames.SmallChange);
            }
        }
        #endregion

        public WpfSlider()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Slider");
        }

        public WpfSlider(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Slider");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string LargeChange = "LargeChange";
            public static readonly string MaximumPosition = "MaximumPosition";
            public static readonly string MinimumPosition = "MinimumPosition";
            public static readonly string Position = "Position";
            public static readonly string PositionAsString = "PositionAsString";
            public static readonly string SmallChange = "SmallChange";
        }
    }
}