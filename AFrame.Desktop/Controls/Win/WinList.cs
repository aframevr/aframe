using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinList : WinControl
    {
        #region Properties
        public virtual int[] CheckedIndices
        {
            get
            {
                return (int[])base.GetProperty(PropertyNames.CheckedIndices);
            }
            set
            {
                this.SetProperty(PropertyNames.CheckedIndices, value);
            }
        }

        public virtual string[] CheckedItems
        {
            get
            {
                return (string[])base.GetProperty(PropertyNames.CheckedItems);
            }
            set
            {
                this.SetProperty(PropertyNames.CheckedItems, value);
            }
        }

        public virtual UITestControlCollection Columns
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.Columns);
            }
        }

        public virtual UITestControl HorizontalScrollBar
        {
            get
            {
                return (UITestControl)base.GetProperty(PropertyNames.HorizontalScrollBar);
            }
        }

        public virtual bool IsCheckedList
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.IsCheckedList);
            }
        }

        public virtual bool IsIconView
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.IsIconView);
            }
        }

        public virtual bool IsListView
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.IsListView);
            }
        }

        public virtual bool IsMultipleSelection
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.IsMultipleSelection);
            }
        }

        public virtual bool IsReportView
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.IsReportView);
            }
        }

        public virtual bool IsSmallIconView
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.IsSmallIconView);
            }
        }

        public virtual UITestControlCollection Items
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.Items);
            }
        }

        public virtual int[] SelectedIndices
        {
            get
            {
                return (int[])base.GetProperty(PropertyNames.SelectedIndices);
            }
            set
            {
                this.SetProperty(PropertyNames.SelectedIndices, value);
            }
        }

        public virtual string[] SelectedItems
        {
            get
            {
                return (string[])base.GetProperty(PropertyNames.SelectedItems);
            }
            set
            {
                this.SetProperty(PropertyNames.SelectedItems, value);
            }
        }

        public virtual string SelectedItemsAsString
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.SelectedItemsAsString);
            }
            set
            {
                this.SetProperty(PropertyNames.SelectedItemsAsString, value);
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

        public WinList()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "List");
        }

        public WinList(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "List");
        }

        public string[] GetColumnNames()
        {
            return ((Microsoft.VisualStudio.TestTools.UITesting.WinControls.WinList)this.RawControl).GetColumnNames();
        }

        public string[] GetContent()
        {
            if (this.GetHeaderListOfListView() == null)
            {
                UITestControlCollection items = this.Items;
                if (items != null)
                {
                    return items.GetNamesOfControls();
                }
            }
            else
            {
                var list = new List<string>();
                UITestControlCollection controls2 = this.Items;
                if (controls2 != null)
                {
                    foreach (Microsoft.VisualStudio.TestTools.UITesting.WinControls.WinListItem item in controls2)
                    {
                        list.AddRange(item.GetColumnValues());
                    }
                    return list.ToArray();
                }
            }
            return null;
        }

        private WinList GetHeaderListOfListView()
        {
            var parent = this.CreateControl<WinWindow>(DesktopControl.PropertyNames.MaxDepth, "1");
            var list = parent.CreateControl<WinList>(DesktopControl.PropertyNames.MaxDepth, "1");
            if (list.Exists)
            {
                return list;
            }
            return null;
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string CheckedIndices = "CheckedIndices";
            public static readonly string CheckedItems = "CheckedItems";
            public static readonly string Columns = "Columns";
            public static readonly string HorizontalScrollBar = "HorizontalScrollBar";
            public static readonly string IsCheckedList = "IsCheckedList";
            public static readonly string IsIconView = "IsIconView";
            public static readonly string IsListView = "IsListView";
            public static readonly string IsMultipleSelection = "IsMultipleSelection";
            public static readonly string IsReportView = "IsReportView";
            public static readonly string IsSmallIconView = "IsSmallIconView";
            public static readonly string Items = "Items";
            public static readonly string SelectedIndices = "SelectedIndices";
            public static readonly string SelectedItems = "SelectedItems";
            public static readonly string SelectedItemsAsString = "SelectedItemsAsString";
            public static readonly string VerticalScrollBar = "VerticalScrollBar";
        }
    }
}
