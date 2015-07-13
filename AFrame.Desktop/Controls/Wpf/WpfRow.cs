using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfRow : WpfControl
    {
        #region Properties
        public virtual bool CanSelectMultiple
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.CanSelectMultiple);
            }
        }

        public virtual UITestControlCollection Cells
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.Cells);
            }
        }

        public virtual UITestControl Header
        {
            get
            {
                return (UITestControl)base.GetProperty(PropertyNames.Header);
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
        #endregion

        public WpfRow()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Row");
        }

        public WpfRow(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Row");
        }

        public WpfCell GetCell(int cellIndex)
        {
            var cell = this.CreateControl<WpfCell>(WpfCell.PropertyNames.ColumnIndex, cellIndex.ToString());
            cell.Find();
            return cell;
        }

        public string[] GetContent()
        {
            UITestControlCollection cells = this.Cells;
            if (cells != null)
            {
                return cells.GetValuesOfControls();
            }
            return null;
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string CanSelectMultiple = "CanSelectMultiple";
            public static readonly string Cells = "Cells";
            public static readonly string Header = "Header";
            public static readonly string RowIndex = "RowIndex";
            public static readonly string Selected = "Selected";
        }
    }
}