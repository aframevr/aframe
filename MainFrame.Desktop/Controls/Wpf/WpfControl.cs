using MainFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Desktop.Controls.Wpf
{
    public class WpfControl : DesktopControl
    {
        public WpfControl(IContext context)
            : base(context, "UIA")
        {
            this.SearchProperties.Add(PropertyNames.FrameworkId, "WPF");

           // Microsoft.VisualStudio.TestTools.UITesting.WpfControls.WpfWindow
        }

        #region Create Control
        public new WpfControl CreateControl(string automationId)
        {
            return this.CreateControl<WpfControl>(automationId);
        }

        public new T CreateControl<T>(string automationId) where T : WpfControl
        {
            return this.CreateControl<T>(new List<SearchProperty> 
            { 
                new SearchProperty(WpfControl.PropertyNames.AutomationId, automationId) 
            });
        }

        public new T CreateControl<T>(IEnumerable<SearchProperty> searchProperties) where T : WpfControl
        {
            return base.CreateControl<T>(searchProperties);
        } 
        #endregion

        #region Properties
        public virtual string AcceleratorKey
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.AcceleratorKey);
            }
        }

        public virtual string AccessKey
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.AccessKey);
            }
        }

        public virtual string AutomationId
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.AutomationId);
            }
        }

        public virtual string Font
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.Font);
            }
        }

        public virtual string FrameworkId
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.FrameworkId);
            }
        }

        public virtual string HelpText
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.HelpText);
            }
        }

        public virtual string ItemStatus
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.ItemStatus);
            }
        }

        public virtual string LabeledBy
        {
            get
            {
                return (string)base.GetProperty(PropertyNames.LabeledBy);
            }
        }
        #endregion

        public new class PropertyNames : DesktopControl.PropertyNames
        {
            public static readonly string AcceleratorKey = "AcceleratorKey";
            public static readonly string AccessKey = "AccessKey";
            public static readonly string AutomationId = "AutomationId";
            public static readonly string Font = "Font";
            public static readonly string FrameworkId = "FrameworkId";
            public static readonly string HelpText = "HelpText";
            public static readonly string ItemStatus = "ItemStatus";
            public static readonly string LabeledBy = "LabeledBy";
        }
    }
}
