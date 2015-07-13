using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinRow : WinControl
    {
        #region Properties
        public virtual UITestControlCollection Cells
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.Cells);
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
        }
        #endregion

        public WinRow()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Row");
        }

        public WinRow(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Row");
        }

        public WinCell GetCell(int cellIndex)
        {
            var cell = this.CreateControl<WinCell>(WinCell.PropertyNames.ColumnIndex, cellIndex.ToString());
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

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string Cells = "Cells";
            public static readonly string RowIndex = "RowIndex";
            public static readonly string Selected = "Selected";
        }
    }
}