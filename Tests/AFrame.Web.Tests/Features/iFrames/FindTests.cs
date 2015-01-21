using AFrame.Web.Controls;
using AFrame.Web.Tests.PageObjects;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;

namespace AFrame.Web.Tests.Features.iFrames
{
    [TestClass]
    public class FindTests : BaseTest
    {
        [TestMethod]
        public void CanFindiFrameTextBox()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);

            var tb = homePage.CreateControl<WebControl>("[iframe='#testiframe'] #inner-frame-textbox");

            Assert.AreEqual("text box in iframe", tb.GetAttribute("value"));
        }

        [TestMethod]
        public void CanFindIFrameAfterFindingSomethingElse()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);

            //First Find
            Assert.AreEqual("Always Here", homePage.CreateControl<WebControl>(".always").Text);

            //iFrame Find
            Assert.AreEqual("text box in iframe", homePage.CreateControl<WebControl>("[iframe='#testiframe'] #inner-frame-textbox").GetAttribute("value"));
        }

        [TestMethod]
        public void CanFindSomethingElseAfterIFrameFound()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);

            //iFrame Find
            Assert.AreEqual("text box in iframe", homePage.CreateControl<WebControl>("[iframe='#testiframe'] #inner-frame-textbox").GetAttribute("value"));

            //Second Find
            Assert.AreEqual("Always Here", homePage.CreateControl<WebControl>(".always").Text);
        }
    }
}