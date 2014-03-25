using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;
using OpenQA.Selenium.Firefox;
using Mainframe.Pages;
using System.Linq;
using Mainframe.Web;

namespace Mainframe.Tests
{
    [TestClass]
    public class GoogleSearchTest
    {
        WebContext Context;

        [TestInitialize]
        public void Init()
        {
            this.Context = new WebContext(new FirefoxDriver());
        }

        [TestCleanup]
        public void Clean()
        {
            this.Context.Dispose();
            this.Context = null;
        }

        [TestMethod]
        public void TestMethod1()
        {
            var homepage = this.Context.NavigateTo<Homepage>("https://www.google.com.au/search?q=test");

            //Click the 2nd search result.
            homepage.Results.ElementAt(1).Link.Click();
            Assert.IsTrue(homepage.Context.Driver.Url.Contains("http://www.speedtest.net"));

            homepage = this.Context.NavigateTo<Homepage>("https://www.google.com.au/search?q=test");


            homepage.Results.ElementAt(2).Link.Click();
            Assert.IsTrue(homepage.Context.Driver.Url.Contains("http://www.ozspeedtest.com"));
        }

    }
}
