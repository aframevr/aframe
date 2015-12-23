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
        public string AbsoluteSelector { get { return Helpers.ToAbsoluteSelector(this); } }

        public new WebContext Context { get { return base.Context as WebContext; } }

        public new WebControl Parent
        {
            get { return base.Parent as WebControl; }
            set { base.Parent = value; }
        }

        public new IWebElement RawControl 
        { 
            get 
            {
                return base.RawControl as IWebElement;
            } 
        }

        public WebControl()
            : base(Technology.Web)
        { }

        public WebControl(WebContext context)
            : base(context, Technology.Web)
        { }

        #region IWebElement
        public void Clear()
        {
            this.RetryIfStaleElementReferenceException<object>(() =>
            {
                this.RawControl.Clear();
                return null;
            });
        }

        public void Click()
        {
            this.RetryIfStaleElementReferenceException<object>(() =>
            {
                this.RawControl.Click();
                return null;
            });
        }

        public bool Displayed
        {
            get 
            {
                return this.RetryIfStaleElementReferenceException<bool>(() =>
                {
                    return this.RawControl.Displayed;
                });
            }
        }

        public bool Enabled
        {
            get 
            {
                return this.RetryIfStaleElementReferenceException<bool>(() =>
                {
                    return this.RawControl.Enabled;
                });
            }
        }

        public string GetAttribute(string attributeName)
        {
            return this.RetryIfStaleElementReferenceException<string>(() =>
            {
                return this.RawControl.GetAttribute(attributeName);
            });
        }

        public string GetCssValue(string propertyName)
        {
            return this.RetryIfStaleElementReferenceException<string>(() =>
            {
                return this.RawControl.GetCssValue(propertyName);
            });
        }

        public System.Drawing.Point Location
        {
            get 
            {
                return this.RetryIfStaleElementReferenceException<System.Drawing.Point>(() =>
                {
                    return this.RawControl.Location;
                });
            }
        }

        public bool Selected
        {
            get 
            {
                return this.RetryIfStaleElementReferenceException<bool>(() =>
                {
                    return this.RawControl.Selected;
                });
            }
        }

        public void SendKeys(string text)
        {
            this.RetryIfStaleElementReferenceException<object>(() =>
            {
                this.RawControl.SendKeys(text);
                return null;
            });
        }

        public System.Drawing.Size Size
        {
            get 
            {
                return this.RetryIfStaleElementReferenceException<System.Drawing.Size>(() =>
                {
                    return this.RawControl.Size;
                });
            }
        }

        public void Submit()
        {
            this.RetryIfStaleElementReferenceException<object>(() =>
            {
                this.RawControl.Submit();
                return null;
            });
        }

        public string TagName
        {
            get 
            {
                return this.RetryIfStaleElementReferenceException<string>(() =>
                {
                    return this.RawControl.TagName; 
                });
            }
        }

        public string Text
        {
            get 
            {
                return this.RetryIfStaleElementReferenceException<string>(() =>
                {
                    return this.RawControl.Text;
                });
            }
        }
        #endregion

        private TReturn RetryIfStaleElementReferenceException<TReturn>(Func<TReturn> function)
        {
            var attempted = 0;
            while (true)
            {
                try
                {
                    attempted++;
                    return function.Invoke();
                }
                catch (StaleElementReferenceException)
                {
                    if (attempted > this.Context.NumberOfTimesToRetryForStaleElementExceptions)
                    {
                        throw;
                    }
                    else
                    {
                        Console.WriteLine("Swallowed StaleElementReferenceException. Times attempted: {0}", attempted);
                    }
                }
            }
        }

        public override void Highlight()
        {
            this.RetryIfStaleElementReferenceException<object>(() =>
            {
                this.ExecuteScript("$(arguments[0]).stop().css('outline', '50px solid rgba(255, 0, 0, .7)').animate({ 'outline-width': '1px' }, 50);", this.RawControl);
                return null;
            });
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
            return this.CreateControl<T>(WebControl.SearchNames.JQuerySelector, jQuerySelector);
        }

        public new T CreateControl<T>(params string[] nameValuePairs) where T : WebControl
        {
            return base.CreateControl<T>(nameValuePairs);
        }

        public new T CreateControl<T>(IEnumerable<SearchProperty> searchProperties) where T : WebControl
        {
            return base.CreateControl<T>(searchProperties);
        }
        #endregion

        #region Create Controls
        public IEnumerable<WebControl> CreateControls(string jQuerySelector)
        {
            return this.CreateControls<WebControl>(jQuerySelector);
        }

        public IEnumerable<T> CreateControls<T>(string jQuerySelector) where T : WebControl
        {
            return this.CreateControls<T>(new SearchProperty[] { new SearchProperty(WebControl.SearchNames.JQuerySelector, jQuerySelector) });
        }

        public new IEnumerable<T> CreateControls<T>(IEnumerable<SearchProperty> searchProperties) where T : WebControl
        {
            return ((WebControlCollection<T>)Activator.CreateInstance(typeof(WebControlCollection<T>), this.Context, this, searchProperties)).AsEnumerable();
        }
        #endregion

        public new class SearchNames : Control.SearchNames
        {
            public static readonly string JQuerySelector = "JQuerySelector";
        }
    }
}