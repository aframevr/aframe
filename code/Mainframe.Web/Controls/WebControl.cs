using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mainframe.Web.Controls
{
    public class WebControl : Control
    {
        public new WebContext Context { get { return base.Context as WebContext; } }
        public new IWebElement RawControl { get { return base.RawControl as IWebElement; } }
        public By By { get { return this.Context.SearchParameters.ToAbsoluteBy(); } }

        public WebControl(Context context)
            : base(context, Mainframe.Technology.Web)
        { }

        public void Clear()
        {
            this.RawControl.Clear();
        }

        public void Click()
        {
            this.RawControl.Click();
        }

        public bool Displayed
        {
            get { return this.RawControl.Displayed; }
        }

        public bool Enabled
        {
            get { return this.RawControl.Enabled; }
        }

        public string GetAttribute(string attributeName)
        {
            return this.RawControl.GetAttribute(attributeName);
        }

        public string GetCssValue(string propertyName)
        {
            return this.RawControl.GetCssValue(propertyName);
        }

        public System.Drawing.Point Location
        {
            get { return this.RawControl.Location; }
        }

        public bool Selected
        {
            get { return this.RawControl.Selected; }
        }

        public void SendKeys(string text)
        {
            this.RawControl.SendKeys(text);
        }

        public System.Drawing.Size Size
        {
            get { return this.RawControl.Size; }
        }

        public void Submit()
        {
            this.RawControl.Submit();
        }

        public string TagName
        {
            get { return this.RawControl.TagName; }
        }

        public string Text
        {
            get { return this.RawControl.Text; }
        }

        public override object RawFind()
        {
            return this.Context.Driver.FindElement(this.By);
        }
    }
}