using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinScrollBar : WinControl
    {
        #region Properties
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

        public virtual int Position
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.Position);
            }
            set
            {
                this.SetProperty(PropertyNames.Position, value);
            }
        }
        #endregion

        public WinScrollBar()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "ScrollBar");
        }

        public WinScrollBar(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "ScrollBar");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string MaximumPosition = "MaximumPosition";
            public static readonly string MinimumPosition = "MinimumPosition";
            public static readonly string Position = "Position";
        }
    }
}