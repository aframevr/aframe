using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinEdit : WinControl
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

        public virtual int CurrentLine
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.CurrentLine);
            }
        }

        public virtual int InsertionIndexAbsolute
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.InsertionIndexAbsolute);
            }
            set
            {
                this.SetProperty(PropertyNames.InsertionIndexAbsolute, value);
            }
        }

        public virtual int InsertionIndexLineRelative
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.InsertionIndexLineRelative);
            }
        }

        public virtual bool IsPassword
        {
            get
            {
                return (bool)base.GetProperty(PropertyNames.IsPassword);
            }
        }

        public virtual int LineCount
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.LineCount);
            }
        }

        public virtual int MaxLength
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.MaxLength);
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

        public virtual int SelectionEnd
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.SelectionEnd);
            }
            set
            {
                this.SetProperty(PropertyNames.SelectionEnd, value);
            }
        }

        public virtual int SelectionStart
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.SelectionStart);
            }
            set
            {
                this.SetProperty(PropertyNames.SelectionStart, value);
            }
        }

        public virtual string SelectionText
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.SelectionText);
            }
            set
            {
                this.SetProperty(PropertyNames.SelectionText, value);
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

        public WinEdit()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Edit");
        }

        public WinEdit(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Edit");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
            public static readonly string CopyPastedText = "CopyPastedText";
            public static readonly string CurrentLine = "CurrentLine";
            public static readonly string InsertionIndexAbsolute = "InsertionIndexAbsolute";
            public static readonly string InsertionIndexLineRelative = "InsertionIndexLineRelative";
            public static readonly string IsPassword = "IsPassword";
            public static readonly string LineCount = "LineCount";
            public static readonly string MaxLength = "MaxLength";
            public static readonly string Password = "Password";
            public static readonly string ReadOnly = "ReadOnly";
            public static readonly string SelectionEnd = "SelectionEnd";
            public static readonly string SelectionStart = "SelectionStart";
            public static readonly string SelectionText = "SelectionText";
            public static readonly string Text = "Text";
        }
    }
}