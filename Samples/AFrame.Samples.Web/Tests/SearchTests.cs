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
        //[TestMethod]
        //public void IsAFrameWebTheFirstSearchResult_PageObjects()
        //{
        //    //Arrange
        //    var homePage = this.WebContext.NavigateTo<HomePage>(UrlHelper.SiteUrl);
        //    var packagesPage = this.WebContext.CreateControl<PackagesPage>();

        //    //Act
        //    homePage.SearchFor("AFrame.Web");

        //    //Assert
        //    Assert.AreEqual("Web Automation Framework", packagesPage.Packages.First().Name);
        //}

        [TestMethod]
        public void IsAFrameWebTheFirstSearchResult_QuickAndDirty()
        {
            //Arrange
            var page = this.WebContext.NavigateTo(UrlHelper.SiteUrl);


            var searchBox = page.CreateControl("#searchBoxInput");
            var searchBtn = page.CreateControl("#searchBoxSubmit");

            var packageNames = page.CreateControls("#searchResults .package .package-list-header h1 a");

            //Act
            searchBox.SendKeys("AFrame.Web");
            searchBtn.Click();

            //Assert
            Assert.AreEqual("Web Automation Framework", packageNames.First().Text);
        }
    }
}