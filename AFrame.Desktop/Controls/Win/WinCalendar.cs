using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinCalendar : WinControl
    {
        #region Properties
        public virtual System.Windows.Forms.SelectionRange SelectionRange
        {
            get
            {
                return (System.Windows.Forms.SelectionRange)base.GetProperty(PropertyNames.SelectionRange);
            }
            set
            {
                this.SetProperty(PropertyNames.SelectionRange, value);
            }
        }

        public virtual string SelectionRangeAsString
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.SelectionRangeAsString);
            }
            set
            {
                this.SetProperty(PropertyNames.SelectionRangeAsString, value);
            }
        }
        #endregion

        public WinCalendar()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Calendar");
        }

        public WinCalendar(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Calendar");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string SelectionRange = "SelectionRange";
            public static readonly string SelectionRangeAsString = "SelectionRangeAsString";
        }
    }
}
