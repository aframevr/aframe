using MainFrame.Web.Controls;
using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Web
{
    public static class Extensions
    {
        public static T NavigateTo<T>(this WebContext webContext, string url) where T : WebControl
        {
            webContext.Driver.Url = url;
            webContext.Driver.Navigate();
            return webContext.As<T>();
        }

        public static WebControl NavigateTo(this WebContext webContext, string url)
        {
            return NavigateTo<WebControl>(webContext, url);
        }

        

        public static object ExecuteScript(this WebContext webContext, string script, params object[] args)
        {
            var javaScriptExecutor = (IJavaScriptExecutor)webContext.Driver;
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