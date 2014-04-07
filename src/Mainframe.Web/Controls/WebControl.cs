using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Web.Controls
{
    public class WebControl : Control
    {
        public new WebContext Context { get { return base.Context as WebContext; } }

        public new IWebElement RawControl { get { return base.RawControl as IWebElement; } }

        public WebControl(Context context)
            : base(context, Technology.Web)
        { }

        #region IWebElement
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
        #endregion

        public override void Highlight()
        {
            this.ExecuteScript("$(arguments[0]).stop().css('outline', '50px solid rgba(255, 0, 0, .7)').animate({ 'outline-width': '1px' }, 50);", this.RawControl);
        }

        public object ExecuteScript(string script, params object[] args)
        {
            return this.Context.ExecuteScript(script, args);
        }

        protected override object RawFind()
        {
            var jQuerySelector = this.Context.SearchParameters.ToAbsoluteSelector();
            var elements = this.Context.JQueryFindElements(jQuerySelector);
            return elements.FirstOrDefault();
        }

        public bool WaitUntil(Predicate<WebControl> conditionEvaluator, int millisecondsTimeout)
        {
            return base.WaitUntil(conditionEvaluator, millisecondsTimeout);
        }

        public bool WaitUntil(Predicate<WebControl> conditionEvaluator)
        {
            return base.WaitUntil(conditionEvaluator);
        }

        public new T CreateControl<T>(IEnumerable<SearchParameter> searchParameters) where T : WebControl
        {
            //Each time we create a control, we add the selector of its parent.
            var allSearchParameters = new SearchParameterCollection();
            allSearchParameters.Add(this.Context.SearchParameters); //Parent
            allSearchParameters.Add(searchParameters);

            var context = new WebContext(this.Context.Driver, this.Context, allSearchParameters);
            return (T)Activator.CreateInstance(typeof(T), context);
        }

        public new IEnumerable<T> CreateControls<T>(IEnumerable<SearchParameter> searchParameters) where T : WebControl
        {
            //Each time we create a control, we add the selector of its parent.
            var allSearchParameters = new SearchParameterCollection();
            allSearchParameters.Add(this.Context.SearchParameters); //Parent
            allSearchParameters.Add(searchParameters);

            //Each time we create a control, we add the selector of its parent.
            var context = new WebContext(this.Context.Driver, this.Context.ParentContext /* Skip to parent */, allSearchParameters);
            return ((WebControlCollection<T>)Activator.CreateInstance(typeof(WebControlCollection<T>), context, searchParameters)).AsEnumerable();
        }

        public new class SearchProperties : Control.SearchProperties
        {
            public const string JQuerySelector = "JQuerySelector";
        }
    }
}