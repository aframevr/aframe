using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium.Firefox;
using System;
using System.IO;
using System.Reflection;

namespace AFrame.Web.Tests
{
    [DeploymentItem("app.html", "app")]
    [DeploymentItem("iframe.html", "app")]
    [DeploymentItem("nestedIframe.html", "app")]
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
                {
                    this._context = new WebContext(new FirefoxDriver());
                }

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
