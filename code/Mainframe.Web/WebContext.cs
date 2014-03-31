using Mainframe.Web.Controls;
using OpenQA.Selenium;
using OpenQA.Selenium.Remote;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mainframe.Web
{
    public class WebContext : Context
    {
        public IWebDriver Driver { get; private set; }

        public WebContext(IWebDriver driver)
            : this(driver, null, null)
        { }

        public WebContext(IWebDriver driver, IContext parentContext, SearchParameterCollection searchParameters)
            : base(parentContext, searchParameters)
        {
            this.Driver = driver;
        }

        public T NavigateTo<T>(string url) where T : WebControl
        {
            this.Driver.Url = url;
            this.Driver.Navigate();
            return As<T>(this);
        }

        public T As<T>(WebContext context) where T : WebControl
        {
            return (T)Activator.CreateInstance(typeof(T), context);
        }

        public override void Dispose()
        {
            this.Driver.Quit();
        }
    }
}