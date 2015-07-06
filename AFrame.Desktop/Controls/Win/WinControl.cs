using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinControl : DesktopControl
    {
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

        public virtual string ToolTipText
        {
            get
            {
                var ctrl = (Microsoft.VisualStudio.TestTools.UITesting.WinControls.WinControl)this.RawControl;
                return ctrl.ToolTipText;
            }
        }
        #endregion

        public WinControl(DesktopContext context, DesktopControl parent)
            : base(context, parent, "MSAA")
        { }

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