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

        public WebContext(IWebDriver driver, IContext parentContext, SearchParameterCollection searchParameters)
            : base(parentContext, searchParameters)
        {
            this.Driver = driver;
        }

        public override void Dispose()
        {
            this.Driver.Quit();
        }
    }
}