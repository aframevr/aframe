using AFrame.Core;
using AFrame.Web.Controls;
using AFrame.Web.Tests.PageObjects;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;

namespace AFrame.Web.Tests.Features.CreatingControls
{
    [TestClass]
    public class CreatingControlsTests : BaseTest
    {
        [TestMethod]
        public void CreateControlsWithNoConstructors()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);
            Assert.AreEqual(3, homePage.Races.Count());
        }

        [TestMethod]
        public void CreateControlsWithMixedConstructors()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);
            Assert.AreEqual(2, homePage.FindCrazyMultiple.Count());
        }

        [TestMethod]
        public void CreateControlsByDirectConstructor()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);

            var races = new WebControlCollection<WebControl>(homePage.Context, homePage, new SearchProperty[] { new SearchProperty(WebControl.SearchNames.JQuerySelector, ".race") });

            Assert.AreEqual(3, races.Count());
        }

        [TestMethod]
        public void CreateControlByPropertySet()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);

            var race = new WebControl(homePage.Context);
            race.Parent = homePage;
            race.SearchProperties.Add(WebControl.SearchNames.JQuerySelector, ".race .item:eq(0)");

            Assert.AreEqual("Race1 Item1", race.Text);
        }
    }
}