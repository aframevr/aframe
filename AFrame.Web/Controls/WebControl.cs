using AFrame.Core;
using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Web.Controls
{
    public class WebControl : Control
    {
        public string AbsoluteSelector { get { return Helpers.ToAbsoluteSelector(this.SearchProperties); } }

        public new WebContext Context { get { return base.Context as WebContext; } }

        public new IWebElement RawControl { get { return base.RawControl as IWebElement; } }

        public WebControl(WebContext context)
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
            var elements = Helpers.JQueryFindElements(this.Context, this.AbsoluteSelector);
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

        #region Create Control
        public WebControl CreateControl(string jQuerySelector)
        {
            return this.CreateControl<WebControl>(jQuerySelector);
        }

        public T CreateControl<T>(string jQuerySelector) where T : WebControl
        {
            return this.CreateControl<T>(new List<SearchProperty> 
            { 
                new SearchProperty(WebControl.SearchNames.JQuerySelector, jQuerySelector) 
            });
        }

        public T CreateControl<T>(params string[] nameValuePairs) where T : WebControl
        {
            if ((nameValuePairs.Length % 2) != 0)
            {
                throw new ArgumentException("CreateControl needs to have even number of pairs. (Mod 2)", "nameValuePairs");
            }
            var searchProperties = new List<SearchProperty>();
            for (int i = 0; i < nameValuePairs.Length; i = (int)(i + 2))
            {
                searchProperties.Add(new SearchProperty(nameValuePairs[i], nameValuePairs[i + 1]));
            }

            return this.CreateControl<T>(searchProperties);
        }

        public new T CreateControl<T>(IEnumerable<SearchProperty> searchProperties) where T : WebControl
        {
            //Each time we create a control, we its parents properties.
            var searchPropertyStack = new SearchPropertyStack();
            searchPropertyStack.Add(this.Context.SearchPropertyStack); //Parent
            searchPropertyStack.Add(searchProperties);

            var context = new WebContext(this.Context.Driver, this.Context, searchPropertyStack);
            return (T)Activator.CreateInstance(typeof(T), context);
        }
        #endregion

        #region Create Controls
        public IEnumerable<WebControl> CreateControls(string jQuerySelector)
        {
            return this.CreateControls<WebControl>(jQuerySelector);
        }

        public IEnumerable<T> CreateControls<T>(string jQuerySelector) where T : WebControl
        {
            return this.CreateControls<T>(new List<SearchProperty> 
            { 
                new SearchProperty(WebControl.SearchNames.JQuerySelector, jQuerySelector) 
            });
        }



        public new IEnumerable<T> CreateControls<T>(IEnumerable<SearchProperty> searchProperties) where T : WebControl
        {
            //Each time we create a control, we add its parent.
            var searchPropertiesStack = new SearchPropertyStack();
            searchPropertiesStack.Add(this.Context.SearchPropertyStack); //Parent
            searchPropertiesStack.Add(searchProperties);

            //Each time we create a control, we add the selector of its parent.
            var context = new WebContext(this.Context.Driver, this.Context.ParentContext /* Skip to parent */, searchPropertiesStack);
            return ((WebControlCollection<T>)Activator.CreateInstance(typeof(WebControlCollection<T>), context, searchProperties)).AsEnumerable();
        }
        #endregion

        public new class SearchNames : Control.SearchNames
        {
            public static readonly string JQuerySelector = "JQuerySelector";
        }
    }
}