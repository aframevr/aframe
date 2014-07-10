using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Web.Sample.NuGet.Framework;
using Web.Sample.NuGet.Objects;
using Web.Sample.NuGet.Modules.Packages;

namespace Web.Sample.NuGet.Tests
{
    [TestClass]
    public class SearchTests : TestBase
    {
        [TestMethod]
        public void Maintainable_IsMainFrameWebTheFirstSearchResult()
        {
            ////Arrange
            //var homePage = this.WebContext.NavigateTo<HomePage>(UrlHelper.SiteUrl);
            //var packagesPage = this.WebContext.As<PackagesPage>();

            ////Act
            //homePage.SearchFor("MainFrame.Web");

            ////Assert
            //Assert.IsTrue(packagesPage.Packages.First().Name, "MainFrame.Web");
        }

        [TestMethod]
        public void Dirty_IsMainFrameWebTheFirstSearchResult()
        {
            ////Arrange
            //var page = this.WebContext.NavigateTo(UrlHelper.SiteUrl);

            ////Act
            //page.CreateControl("#searchBoxInput").SendKeys("MainFrame.Web");
            //page.CreateControl("#searchBoxSubmit").Click();

            //homePage.SearchFor("MainFrame.Web");

            ////Assert
            //Assert.IsTrue(packagesPage.Packages.First().Name, "MainFrame.Web");
        }
    }
}