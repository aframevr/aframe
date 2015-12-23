using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinSlider : WinControl
    {
        #region Properties
        public virtual int LineSize
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.LineSize);
            }
        }

        public virtual int MaximumPosition
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.MaximumPosition);
            }
        }

        public virtual int MinimumPosition
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.MinimumPosition);
            }
        }

        public virtual int PageSize
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.PageSize);
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

        public virtual int TickCount
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.TickCount);
            }
        }

        public virtual int TickPosition
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.TickPosition);
            }
        }

        public virtual int TickValue
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.TickValue);
            }
        }
        #endregion

        public WinSlider()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Slider");
        }

        public WinSlider(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Slider");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string LineSize = "LineSize";
            public static readonly string MaximumPosition = "MaximumPosition";
            public static readonly string MinimumPosition = "MinimumPosition";
            public static readonly string PageSize = "PageSize";
            public static readonly string Position = "Position";
            public static readonly string PositionAsString = "PositionAsString";
            public static readonly string TickCount = "TickCount";
            public static readonly string TickPosition = "TickPosition";
            public static readonly string TickValue = "TickValue";
        }
    }
}
