using Mainframe.Web.Tests.TestApp;
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

namespace Mainframe.Web.Tests
{
    [DeploymentItem("TestApp\\TestApp.html", "TestApp")]
    [TestClass]
    public class BaseTest
    {
        public WebContext Context;
        public HomePage HomePage;

        [TestInitialize]
        public void Init()
        {
            var dirPath = Path.GetDirectoryName(new UriBuilder(Assembly.GetExecutingAssembly().GetName().CodeBase).Uri.LocalPath);
            this.Context = new WebContext(new FirefoxDriver());
            var url = Path.Combine(dirPath, "TestApp", "TestApp.html");
            this.HomePage = this.Context.NavigateTo<HomePage>(url);
        }

        [TestCleanup]
        public void Clean()
        {
            this.Context.Dispose();
            this.Context = null;
        }
    }
}
