using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfCell : WpfControl
    {
        #region Properties
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

        public virtual int ColumnIndex
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.ColumnIndex);
            }
        }

        public virtual string ContentControlType
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.ContentControlType);
            }
        }

        public virtual bool Indeterminate
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Indeterminate);
            }
            set
            {
                this.SetProperty(PropertyNames.Indeterminate, value);
            }
        }

        public virtual bool ReadOnly
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.ReadOnly);
            }
        }

        public virtual int RowIndex
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.RowIndex);
            }
        }

        public virtual bool Selected
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Selected);
            }
        }

        public virtual string Value
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.Value);
            }
            set
            {
                this.SetProperty(PropertyNames.Value, value);
            }
        }
        #endregion

        public WpfCell()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Cell");
        }

        public WpfCell(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Cell");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string Checked = "Checked";
            public static readonly string ColumnHeader = "ColumnHeader";
            public static readonly string ColumnIndex = "ColumnIndex";
            public static readonly string ContentControlType = "ContentControlType";
            public static readonly string Indeterminate = "Indeterminate";
            public static readonly string ReadOnly = "ReadOnly";
            public static readonly string RowIndex = "RowIndex";
            public static readonly string Selected = "Selected";
        }
    }
}