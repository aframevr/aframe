using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfList : WpfControl
    {
        #region Properties
        public string[] GetContent()
        {
            UITestControlCollection items = this.Items;
            if (items != null)
            {
                return items.GetNamesOfControls();
            }
            return null;
        }

        public virtual bool IsMultipleSelection
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.IsMultipleSelection);
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
        #endregion

        public WpfList()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "List");
        }

        public WpfList(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "List");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string IsMultipleSelection = "IsMultipleSelection";
            public static readonly string Items = "Items";
            public static readonly string SelectedIndices = "SelectedIndices";
            public static readonly string SelectedItems = "SelectedItems";
            public static readonly string SelectedItemsAsString = "SelectedItemsAsString";
        }
    }
}