using MainFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Desktop.Controls.Win
{
    public class WinControl : DesktopControl
    {
        public WinControl(IContext context)
            : base(context, "MSAA")
        {
            //Microsoft.VisualStudio.TestTools.UITesting.WinControls.WinControl
        }

        #region Create Control
        public new WinControl CreateControl(string name)
        {
            return base.CreateControl<WinControl>(name);
        }

        public new T CreateControl<T>(string name) where T : WinControl
        {
            return base.CreateControl<T>(name);
        }

        public new T CreateControl<T>(IEnumerable<SearchProperty> searchProperties) where T : WinControl
        {
            return base.CreateControl<T>(searchProperties);
        } 
        #endregion

        #region Properties
        public string AccessibleDescription
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.AccessibleDescription);
            }
        }

        public virtual string AccessKey
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.AccessKey);
            }
        }

        public virtual int ControlId
        {
            get
            {
                return (int)base.GetProperty(PropertyNames.ControlId);
            }
        }

        public virtual string ControlName
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.ControlName);
            }
        }

        public virtual string HelpText
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.HelpText);
            }
        } 
        #endregion

        public new abstract class PropertyNames : DesktopControl.PropertyNames
        {
            public static readonly string AccessibleDescription = "AccessibleDescription";
            public static readonly string AccessKey = "AccessKey";
            public static readonly string ControlId = "ControlId";
            public static readonly string ControlName = "ControlName";
            public static readonly string HelpText = "HelpText";
        }
    }
}
