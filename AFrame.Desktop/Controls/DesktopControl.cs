using AFrame.Core;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls
{
    public abstract class DesktopControl : Control
    {
        public new DesktopContext Context { get { return base.Context as DesktopContext; } }

        public new DesktopControl Parent
        {
            get { return base.Parent as DesktopControl; }
            set { base.Parent = value; }
        }

        public new UITestControl RawControl { get { return base.RawControl as UITestControl; } }

        internal string _technologyName;

        public DesktopControl(string technologyName)
            : base(Technology.Desktop)
        {
            this._technologyName = technologyName;
        }

        public DesktopControl(DesktopContext context, string technologyName)
            : base(context, Technology.Desktop)
        {
            this._technologyName = technologyName;
        }

        public override void Highlight()
        {
            this.RawControl.DrawHighlight();
        }

        protected override object RawFind()
        {
            var control = Helpers.GenerateUITestControl(this);

            if(!control.Exists)
                throw new ControlNotFoundException(this);

            return control;
        }

        public void Click()
        {
            var raw = this.RawControl;
            Mouse.Click(raw);
        }

        public void DoubleClick()
        {
            Mouse.DoubleClick(this.RawControl);
        }

        #region Properties
        public object GetProperty(string propertyName)
        {
            return this.RawControl.GetProperty(propertyName);
        }

        public void SetProperty(string propertyName, object value)
        {
            this.RawControl.SetProperty(propertyName, value);
        }
        
        public virtual Rectangle BoundingRectangle
        {
            get
            {
                return (Rectangle)this.GetProperty(PropertyNames.BoundingRectangle);
            }
        }
       
        public virtual string ClassName
        {
            get
            {
                return (string)this.GetProperty(PropertyNames.ClassName);
            }
        }

        public virtual string ControlType
        {
            get
            {
                return this.RawControl.ControlType.ToString();
            }
        }

        public virtual bool Enabled
        {
            get
            {
                return (bool)this.GetProperty(PropertyNames.Enabled);
            }
        }

        public virtual string FriendlyName
        {
            get
            {
                return (string)this.GetProperty(PropertyNames.FriendlyName);
            }
        }

        public virtual bool HasFocus
        {
            get
            {
                return (bool)this.GetProperty(PropertyNames.HasFocus);
            }
        }

        public virtual int Height
        {
            get
            {
                return (int)this.GetProperty(PropertyNames.Height);
            }
        }

        public virtual bool IsTopParent
        {
            get
            {
                return this.RawControl.IsTopParent;
            }
        }

        public virtual int Left
        {
            get
            {
                return (int)this.GetProperty(PropertyNames.Left);
            }
        }

        public virtual string Name
        {
            get
            {
                return (string)this.GetProperty(PropertyNames.Name);
            }
        }

        public virtual object NativeElement
        {
            get
            {
                return this.GetProperty(PropertyNames.NativeElement);
            }
        }

        public virtual string State
        {
            get
            {
                return this.RawControl.State.ToString();
            }
        }

        public virtual string TechnologyName
        {
            get
            {
                return this.RawControl.TechnologyName;
            }
        }

        public virtual int Top
        {
            get
            {
                return (int)this.GetProperty(PropertyNames.Top);
            }
        }
        
        public virtual UITestControl TopParent
        {
            get
            {
                return this.RawControl.TopParent;
            }
        }

        public virtual int Width
        {
            get
            {
                return (int)this.GetProperty(PropertyNames.Width);
            }
        }

        public virtual IntPtr WindowHandle
        {
            get
            {
                return (IntPtr)this.GetProperty(PropertyNames.WindowHandle);
            }
        }
        #endregion

        #region Create Control
        public new T CreateControl<T>(params string[] nameValuePairs) where T : DesktopControl
        {
            return base.CreateControl<T>(nameValuePairs);
        }

        public new T CreateControl<T>(IEnumerable<SearchProperty> searchProperties) where T : DesktopControl
        {
            return base.CreateControl<T>(searchProperties);
        }
        #endregion

        public new class PropertyNames : Control.PropertyNames
        {
            public static readonly string BoundingRectangle = "BoundingRectangle";
            public static readonly string ClassName = "ClassName";
            public static readonly string ControlType = "ControlType";
            public static readonly string Enabled = "Enabled";
            public static readonly string Exists = "Exists";
            public static readonly string FriendlyName = "FriendlyName";
            public static readonly string HasFocus = "HasFocus";
            public static readonly string Height = "Height";
            public static readonly string Instance = "Instance";
            public static readonly string IsTopParent = "IsTopParent";
            public static readonly string Left = "Left";
            public static readonly string MaxDepth = "MaxDepth";
            public static readonly string Name = "Name";
            public static readonly string NativeElement = "NativeElement";
            public static readonly string QueryId = "QueryId";
            public static readonly string State = "State";
            public static readonly string TechnologyName = "TechnologyName";
            public static readonly string Top = "Top";
            public static readonly string TopParent = "TopParent";
            public static readonly string UITechnologyElement = "UITechnologyElement";
            public static readonly string Value = "Value";
            public static readonly string Width = "Width";
            public static readonly string WindowHandle = "WindowHandle";
        }
    }
}