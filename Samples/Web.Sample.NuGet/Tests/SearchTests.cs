using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Linq;
using Web.Sample.NuGet.Framework;
using Web.Sample.NuGet.Modules.Home;
using Web.Sample.NuGet.Modules.Packages;

namespace Web.Sample.NuGet.Tests
{
    [TestClass]
    public class SearchTests : TestBase
    {
        [TestMethod]
        public void IsMainFrameWebTheFirstSearchResult_PageObjects()
        {
            //Arrange
            var homePage = this.WebContext.NavigateTo<HomePage>(UrlHelper.SiteUrl);
            var packagesPage = this.WebContext.As<PackagesPage>();

            //Act
            homePage.SearchFor("MainFrame.Web");

            //Assert
            Assert.AreEqual("Web Automation Framework", packagesPage.Packages.First().Name);
        }

        [TestMethod]
        public void IsMainFrameWebTheFirstSearchResult_QuickAndDirty()
        {
            //Arrange
            var page = this.WebContext.NavigateTo(UrlHelper.SiteUrl);
            var searchBox = page.CreateControl("#searchBoxInput");
            var searchBtn = page.CreateControl("#searchBoxSubmit");
            var packageNames = page.CreateControls("#searchResults .package .package-list-header h1 a");

            //Act
            searchBox.SendKeys("MainFrame.Web");
            searchBtn.Click();

            //Assert
            Assert.AreEqual("Web Automation Framework", packageNames.First().Text);
        }
    }
}