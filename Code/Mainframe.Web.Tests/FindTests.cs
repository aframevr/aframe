using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;
using OpenQA.Selenium.Firefox;
using System.Linq;
using Mainframe.Web;
using System.IO;
using System.Reflection;
using Mainframe.Web.Tests.TestApp;
using Mainframe.Web.Controls;
using System.Collections.Generic;
using System.Threading;

namespace Mainframe.Web.Tests
{
    [TestClass]
    public class FindTests : BaseTest
    {
        [TestMethod]
        public void FindsAllRaces()
        {
            var races = this.HomePage.Races;

            Assert.AreEqual("Race1 Item1", races.ElementAt(0).Items.First().Text);
            Assert.AreEqual("Race2 Item3", races.ElementAt(1).Items.ElementAt(2).Text);
            Assert.AreEqual("Race3 Item4", races.Last().Items.Last().Text);
        }

        [TestMethod]
        public void FindsAllRacesAfter1Removed()
        {
            var races = this.HomePage.Races;

            Assert.AreEqual("Race1 Item1", races.ElementAt(0).Items.First().Text);
            Assert.AreEqual("Race2 Item3", races.ElementAt(1).Items.ElementAt(2).Text);
            Assert.AreEqual("Race3 Item4", races.Last().Items.Last().Text);

            Thread.Sleep(10000);

            Assert.AreEqual("Race1 Item1", races.ElementAt(0).Items.First().Text);
            Assert.AreEqual("Race3 Item4", races.ElementAt(1).Items.Last().Text);
        }

        [TestMethod]
        [ExpectedException(typeof(ControlNotFoundException))]
        public void ControlNotFoundTimeout()
        {
            var control = new WebControl(this.Context);
            control.Context.SearchParameters.Add(new List<SearchParameter> { new SearchParameter(WebControl.SearchProperties.JQuerySelector, ".unknown") });
            control.Find();
        }
    }
}