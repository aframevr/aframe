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

        public new UITestControl RawControl { get { return base.RawControl as UITestControl; } }

        internal string TechnologyName;

        public DesktopControl(IContext context, string technologyName)
            : base(context, Technology.Desktop)
        {
            this.TechnologyName = technologyName;
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

        public virtual int Top
        {
            get
            {
                return (int)this.GetProperty(PropertyNames.Top);
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
        public DesktopControl CreateControl(string name)
        {
            return this.CreateControl<DesktopControl>(name);
        }

        public T CreateControl<T>(string name) where T : DesktopControl
        {
            return this.CreateControl<T>(new List<SearchProperty> 
            { 
                new SearchProperty(DesktopControl.PropertyNames.Name, name) 
            });
        }

        public new T CreateControl<T>(IEnumerable<SearchProperty> searchProperties) where T : DesktopControl
        {
            //Each time we create a control, we add its parent.
            var searchPropertyStack = new SearchPropertyStack();
            searchPropertyStack.Add(this.Context.SearchPropertyStack); //Parent
            searchPropertyStack.Add(searchProperties);

            var context = new DesktopContext(this.Context, searchPropertyStack);
            return (T)Activator.CreateInstance(typeof(T), context);
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
            public static readonly string Left = "Left";
            public static readonly string Name = "Name";
            public static readonly string NativeElement = "NativeElement";
            public static readonly string Top = "Top";
            public static readonly string Width = "Width";
            public static readonly string WindowHandle = "WindowHandle";
        }
    }
}