using MainFrame.Web.Tests.App;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.IE;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Web.Tests
{
    [DeploymentItem("app\\app.html", "app")]
    [DeploymentItem("app\\iframe.html", "app")]
    [TestClass]
    public class BaseTest
    {
        public readonly string TestAppUrl = Path.Combine(Path.GetDirectoryName(new UriBuilder(Assembly.GetExecutingAssembly().GetName().CodeBase).Uri.LocalPath), "app", "app.html");

        private WebContext _context;
        public WebContext Context
        {
            get
            {
                if(this._context == null)
                    this._context = new WebContext(new FirefoxDriver());

                return this._context;
            }
        }

        [TestCleanup]
        public void TestCleanup()
        {
            if (this._context != null)
            {
                this._context.Dispose();
            }
        }
    }
}
