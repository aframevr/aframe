using AFrame.Core;
using AFrame.Web.Controls;
using AFrame.Web.Tests.PageObjects;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;

namespace AFrame.Web.Tests.Features.Find
{
    [TestClass]
    public class FindTests : BaseTest
    {
        [TestMethod]
        public void FindsAllRaces()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);
            var races = homePage.Races.ToList();

            Assert.AreEqual("Race1 Item1", races.ElementAt(0).Items.First().Text);
            Assert.AreEqual("Race2 Item3", races.ElementAt(1).Items.ElementAt(2).Text);
            Assert.AreEqual("Race3 Item4", races.Last().Items.Last().Text);
        }

        [TestMethod]
        public void FindsAllRacesAfter1Removed()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);
            var races = homePage.Races;

            Assert.AreEqual("Race1 Item1", races.ElementAt(0).Items.First().Text);
            Assert.AreEqual("Race2 Item3", races.ElementAt(1).Items.ElementAt(2).Text);
            Assert.AreEqual("Race3 Item4", races.Last().Items.Last().Text);

            Thread.Sleep(10000);

            Assert.AreEqual("Race1 Item1", races.ElementAt(0).Items.First().Text);
            Assert.AreEqual("Race3 Item4", races.ElementAt(1).Items.Last().Text);
        }

        [TestMethod]
        public void FindsControlByMultipleSelectors()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);
            var or = homePage.FindOneMultiple.InnerControl;
            Assert.AreEqual("Find or 1", or.Text);

            Thread.Sleep(11000);

            //Fetch it again. Else it will be stale..
            or = homePage.FindOneMultiple.InnerControl;
            Assert.AreEqual("Find or 2", or.Text);
        }

        [TestMethod]
        public void FindsAllControlsByMultipleSelectors()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);
            var ctrls = homePage.FindAllMultiple.MultipleControls;

            Assert.AreEqual(2, ctrls.Count());
            Assert.AreEqual("Find or 1", ctrls.ElementAt(0).Text);
            Assert.AreEqual("Find or 2", ctrls.ElementAt(1).Text);
        }

        [TestMethod]
        public void FindsCrazyMultipleSelectors()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);
            var ctrls = homePage.FindCrazyMultiple;
            Assert.AreEqual(2, ctrls.Count());

            var firstRace = ctrls.ElementAt(0);
            Assert.AreEqual(6, firstRace.Items.Count());

            var secondRace = ctrls.ElementAt(1);
            Assert.AreEqual(8, secondRace.Items.Count());
        }

        [TestMethod]
        [ExpectedException(typeof(ControlNotFoundTimeoutException))]
        public void ControlNotFoundTimeoutThrowsException()
        {
            var control = new WebControl(this.Context);
            control.SearchProperties.Add(new SearchProperty(WebControl.SearchNames.JQuerySelector, ".unknown"));
            control.Find();
        }

        [TestMethod]
        public void ControlNotFoundTimeout()
        {
            var control = new WebControl(this.Context);
            control.SearchProperties.Add(new SearchProperty(WebControl.SearchNames.JQuerySelector, ".unknown"));
            var stoppy = Stopwatch.StartNew();
            try
            {
                Playback.SearchTimeout = 15000;
                control.Find();
            }
            catch (Exception)
            {
                Assert.IsTrue(stoppy.ElapsedMilliseconds > 14000);
                Assert.IsTrue(stoppy.ElapsedMilliseconds < 16000);
            }
        }

        [TestMethod]
        public void ImplicitWaitIfNotThere()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);
            var ctrl = homePage.InsertedStuff.IGotAdded;
            var stoppy = Stopwatch.StartNew();
            Assert.IsTrue(ctrl.Text == "this got added via javascript after 10 seconds");
            Assert.IsTrue(stoppy.ElapsedMilliseconds > 9000);
            Assert.IsTrue(stoppy.ElapsedMilliseconds < 11000);
        }
    }
}