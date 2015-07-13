using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace AFrame.Desktop.Controls.Win
{
    public class WinDateTimePicker : WinControl
    {
        #region Properties
        public virtual UITestControl Calendar
        {
            get
            {
                return (UITestControl)base.GetProperty(PropertyNames.Calendar);
            }
        }

        public virtual bool Checked
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Checked);
            }
            set
            {
                this.SetProperty(PropertyNames.Checked, value);
            }
        }

        public virtual System.DateTime DateTime
        {
            get
            {
                return (System.DateTime)base.GetProperty(PropertyNames.DateTime);
            }
            set
            {
                this.SetProperty(PropertyNames.DateTime, value);
            }
        }

        public virtual string DateTimeAsString
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.DateTimeAsString);
            }
            set
            {
                this.SetProperty(PropertyNames.DateTimeAsString, value);
            }
        }

        public virtual DateTimePickerFormat Format
        {
            get
            {
                return (DateTimePickerFormat)base.GetProperty(PropertyNames.Format);
            }
        }

        public virtual bool HasCheckBox
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.HasCheckBox);
            }
        }

        public virtual bool HasDropDownButton
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.HasDropDownButton);
            }
        }

        public virtual bool HasSpinner
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.HasSpinner);
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

        public WinDateTimePicker()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "DateTimePicker");
        }

        public WinDateTimePicker(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "DateTimePicker");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string Calendar = "Calendar";
            public static readonly string Checked = "Checked";
            public static readonly string DateTime = "DateTime";
            public static readonly string DateTimeAsString = "DateTimeAsString";
            public static readonly string Format = "Format";
            public static readonly string HasCheckBox = "HasCheckBox";
            public static readonly string HasDropDownButton = "HasDropDownButton";
            public static readonly string HasSpinner = "HasSpinner";
            public static readonly string ShowCalendar = "ShowCalendar";
        }
    }
}
