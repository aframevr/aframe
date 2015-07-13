using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfCalendar : WpfControl
    {
        #region Properties
        public virtual bool MultiSelectable
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.MultiSelectable);
            }
        }

        public virtual SelectionRange SelectedDateRange
        {
            set
            {
                this.SetProperty(PropertyNames.SelectedDateRange, value);
            }
        }

        public virtual string SelectedDateRangeAsString
        {
            set
            {
                this.SetProperty(PropertyNames.SelectedDateRangeAsString, value);
            }
        }

        public virtual DateTime[] SelectedDates
        {
            get
            {
                return (DateTime[])base.GetProperty(PropertyNames.SelectedDates);
            }
            set
            {
                this.SetProperty(PropertyNames.SelectedDates, value);
            }
        }

        public virtual string SelectedDatesAsString
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.SelectedDatesAsString);
            }
            set
            {
                this.SetProperty(PropertyNames.SelectedDatesAsString, value);
            }
        }
        #endregion

        public WpfCalendar()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Calendar");
        }

        public WpfCalendar(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Calendar");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string MultiSelectable = "MultiSelectable";
            public static readonly string SelectedDateRange = "SelectedDateRange";
            public static readonly string SelectedDateRangeAsString = "SelectedDateRangeAsString";
            public static readonly string SelectedDates = "SelectedDates";
            public static readonly string SelectedDatesAsString = "SelectedDatesAsString";
        }
    }
}