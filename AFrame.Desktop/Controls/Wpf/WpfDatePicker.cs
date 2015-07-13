using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfDatePicker : WpfControl
    {
        #region Properties
        public virtual UITestControl Calendar
        {
            get
            {
                return (UITestControl)base.GetProperty(PropertyNames.Calendar);
            }
        }

        public virtual DateTime Date
        {
            get
            {
                return (DateTime)base.GetProperty(PropertyNames.Date);
            }
            set
            {
                this.SetProperty(PropertyNames.Date, value);
            }
        }

        public virtual string DateAsString
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.DateAsString);
            }
            set
            {
                this.SetProperty(PropertyNames.DateAsString, value);
            }
        }

        public virtual bool ShowCalendar
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.ShowCalendar);
            }
            set
            {
                this.SetProperty(PropertyNames.ShowCalendar, value);
            }
        } 
        #endregion

        public WpfDatePicker()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "DatePicker");
        }

        public WpfDatePicker(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "DatePicker");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string Calendar = "Calendar";
            public static readonly string Date = "Date";
            public static readonly string DateAsString = "DateAsString";
            public static readonly string ShowCalendar = "ShowCalendar";
        }
    }
}