using AFrame.Web;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Web.Sample.NuGet.Framework
{
    [TestClass]
    public class TestBase
    {
        private WebContext _webContext;
        public WebContext WebContext
        {
            get
            {
                if (this._webContext == null)
                {
                    this._webContext = new WebContext(new OpenQA.Selenium.Firefox.FirefoxDriver());
                }

                return this._webContext;
            }
        }

        [TestCleanup]
        public void CleanUp()
        {
            if (this._webContext != null)
            {
                this._webContext.Dispose();
                this._webContext = null;
            }
        }
    }
}