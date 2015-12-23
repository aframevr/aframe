using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinCell : WinControl
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

        public WinCell()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Cell");
        }

        public WinCell(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Cell");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string Checked = "Checked";
            public static readonly string ColumnIndex = "ColumnIndex";
            public static readonly string Indeterminate = "Indeterminate";
            public static readonly string RowIndex = "RowIndex";
            public static readonly string Selected = "Selected";
        }
    }
}
