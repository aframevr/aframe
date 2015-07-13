using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Wpf
{
    public class WpfEdit : WpfControl
    {
        #region Properties
        public virtual string CopyPastedText
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.CopyPastedText);
            }
            set
            {
                this.SetProperty(PropertyNames.CopyPastedText, value);
            }
        }

        public virtual bool IsPassword
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.IsPassword);
            }
        }

        public virtual string Password
        {
            set
            {
                this.SetProperty(PropertyNames.Password, value);
            }
        }

        public virtual bool ReadOnly
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.ReadOnly);
            }
        }

        public virtual string SelectionText
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.SelectionText);
            }
        }

        public virtual string Text
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.Text);
            }
            set
            {
                this.SetProperty(PropertyNames.Text, value);
            }
        }
        #endregion

        public WpfEdit()
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Edit");
        }

        public WpfEdit(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.ControlType, "Edit");
        }

        public new class PropertyNames : WpfControl.PropertyNames
        {
            public static readonly string CopyPastedText = "CopyPastedText";
            public static readonly string IsPassword = "IsPassword";
            public static readonly string Password = "Password";
            public static readonly string ReadOnly = "ReadOnly";
            public static readonly string SelectionText = "SelectionText";
            public static readonly string Text = "Text";
        }
    }
}