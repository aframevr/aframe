using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfTable : WpfControl
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

        public virtual int ColumnCount
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.ColumnCount);
            }
        }

        public virtual UITestControlCollection ColumnHeaders
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.ColumnHeaders);
            }
        }

        public virtual int RowCount
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.RowCount);
            }
        }

        public virtual UITestControlCollection RowHeaders
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.RowHeaders);
            }
        }

        public virtual UITestControlCollection Rows
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.Rows);
            }
        }
        #endregion

        public WpfTable()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Table");
        }

        public WpfTable(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Table");
        }

        //public WpfCell FindFirstCellWithValue(string value)
        //{
        //    if (this.RowCount != 0)
        //    {
        //        for (UITestControl control = this.GetRow(0); control != null; control = control.NextSibling)
        //        {
        //            WpfCell cell = new WpfCell(control);
        //            cell.SearchProperties.set_Item(WpfCell.PropertyNames.Value, value);
        //            if (cell.TryFind())
        //            {
        //                return cell;
        //            }
        //        }
        //    }
        //    WpfCell cell2 = new WpfCell();
        //    cell2.SearchProperties.Add(UITestControl.PropertyNames.Value, value);
        //    throw new UITestControlNotFoundException(Messages.get_ControlNotFoundWithQidOrCondition(), Playback.GetUITestControlString(cell2), null);
        //}

        public WpfCell GetCell(int rowIndex, int columnIndex)
        {
            var cell = this.CreateControl<WpfCell>();
            cell.SearchProperties.Add(WpfCell.PropertyNames.RowIndex, rowIndex.ToString());
            cell.SearchProperties.Add(WpfCell.PropertyNames.ColumnIndex, columnIndex.ToString());
            cell.Find();
            return cell;
        }

        public string[] GetColumnNames()
        {
            UITestControlCollection columnHeaders = this.ColumnHeaders;
            if (columnHeaders != null)
            {
                return columnHeaders.GetNamesOfControls();
            }
            return null;
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

        public WpfRow GetRow(int rowIndex)
        {
            var row = this.CreateControl<WpfRow>(WpfRow.PropertyNames.RowIndex, rowIndex.ToString());
            row.Find();
            return row;
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string CanSelectMultiple = "CanSelectMultiple";
            public static readonly string Cells = "Cells";
            public static readonly string ColumnCount = "ColumnCount";
            public static readonly string ColumnHeaders = "ColumnHeaders";
            public static readonly string RowCount = "RowCount";
            public static readonly string RowHeaders = "RowHeaders";
            public static readonly string Rows = "Rows";
        }
    }
}