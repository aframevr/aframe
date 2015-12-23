using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinTable : WinControl
    {
        #region Properties
        public virtual UITestControlCollection Cells
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.Cells);
            }
        }

        public virtual UITestControlCollection ColumnHeaders
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.ColumnHeaders);
            }
        }

        public virtual UITestControl HorizontalScrollBar
        {
            get
            {
                return (UITestControl)base.GetProperty(PropertyNames.HorizontalScrollBar);
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

        public virtual UITestControl VerticalScrollBar
        {
            get
            {
                return (UITestControl)base.GetProperty(PropertyNames.VerticalScrollBar);
            }
        }
        #endregion

        public WinTable()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Table");
        }

        public WinTable(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Table");
        }

        public WinCell FindFirstCellWithValue(string value)
        {
            var cell = this.CreateControl<WinCell>(WinCell.PropertyNames.Value, value);
            cell.Find();
            return cell;
        }

        public WinCell GetCell(int rowIndex, int columnIndex)
        {
            var cell = this.CreateControl<WinCell>();
            cell.SearchProperties.Add(WinCell.PropertyNames.RowIndex, rowIndex.ToString());
            cell.SearchProperties.Add(WinCell.PropertyNames.ColumnIndex, columnIndex.ToString());
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

        public WinRow GetRow(int rowIndex)
        {
            var row = this.CreateControl<WinRow>(WinRow.PropertyNames.RowIndex, rowIndex.ToString());
            row.Find();
            return row;
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string Cells = "Cells";
            public static readonly string ColumnHeaders = "ColumnHeaders";
            public static readonly string HorizontalScrollBar = "HorizontalScrollBar";
            public static readonly string RowHeaders = "RowHeaders";
            public static readonly string Rows = "Rows";
            public static readonly string VerticalScrollBar = "VerticalScrollBar";
        }
    }
}