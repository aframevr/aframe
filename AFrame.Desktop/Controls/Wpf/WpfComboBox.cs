using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfComboBox : WpfControl
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

        public virtual string EditableItem
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.EditableItem);
            }
            set
            {
                this.SetProperty(PropertyNames.EditableItem, value);
            }
        }

        public virtual bool Expanded
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.Expanded);
            }
            set
            {
                this.SetProperty(PropertyNames.Expanded, value);
            }
        }

        public virtual UITestControl HorizontalScrollBar
        {
            get
            {
                return (UITestControl)base.GetProperty(PropertyNames.HorizontalScrollBar);
            }
        }

        public virtual bool IsEditable
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.IsEditable);
            }
        }

        public virtual UITestControlCollection Items
        {
            get
            {
                return (UITestControlCollection)base.GetProperty(PropertyNames.Items);
            }
        }

        public virtual int SelectedIndex
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.SelectedIndex);
            }
            set
            {
                this.SetProperty(PropertyNames.SelectedIndex, (int)value);
            }
        }

        public virtual string SelectedItem
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.SelectedItem);
            }
            set
            {
                this.SetProperty(PropertyNames.SelectedItem, value);
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

        public WpfComboBox()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "ComboBox");
        }

        public WpfComboBox(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "ComboBox");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string EditableItem = "EditableItem";
            public static readonly string Expanded = "Expanded";
            public static readonly string HorizontalScrollBar = "HorizontalScrollBar";
            public static readonly string IsEditable = "IsEditable";
            public static readonly string Items = "Items";
            public static readonly string SelectedIndex = "SelectedIndex";
            public static readonly string SelectedItem = "SelectedItem";
            public static readonly string VerticalScrollBar = "VerticalScrollBar";
        }
    }
}