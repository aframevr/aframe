using MainFrame.Core;
using MainFrame.Web.Controls;
using OpenQA.Selenium;
using OpenQA.Selenium.Remote;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Web
{
    public class WebContext : Context
    {
        public IWebDriver Driver { get; private set; }

        public WebContext(IWebDriver driver)
            : this(driver, null, null)
        { }

        public WebContext(IWebDriver driver, IContext parentContext, SearchPropertyStack searchParameters)
            : base(parentContext, searchParameters)
        {
            this.Driver = driver;
        }

        public override void Dispose()
        {
            this.Driver.Quit();
        }

        public T NavigateTo<T>(string url) where T : WebControl
        {
            this.Driver.Url = url;
            this.Driver.Navigate();
            return this.As<T>();
        }

        public WebControl NavigateTo(string url)
        {
            return this.NavigateTo<WebControl>(url);
        }

        public object ExecuteScript(string script, params object[] args)
        {
            var javaScriptExecutor = (IJavaScriptExecutor)this.Driver;
            var isJQueryUndefined = new Func<bool>(() => (bool)javaScriptExecutor.ExecuteScript("return (typeof $ === 'undefined')"));
            if (isJQueryUndefined())
            {
                javaScriptExecutor.ExecuteScript(@"
                    var scheme =  window.location.protocol;
                    if(scheme != 'https:')
                        scheme = 'http:';

                    var script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.src = scheme + '//code.jquery.com/jquery-1.10.1.min.js'; 
                    document.getElementsByTagName('head')[0].appendChild(script);
                ");

                //Todo: put a timeout around this.
                while (isJQueryUndefined())
                {
                    System.Threading.Thread.Sleep(200);
                }
            }

            return javaScriptExecutor.ExecuteScript(script, args);
        }
    }
}