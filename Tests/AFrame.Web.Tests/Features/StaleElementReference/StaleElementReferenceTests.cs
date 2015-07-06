using AFrame.Core;
using AFrame.Web.Tests.PageObjects;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Diagnostics;
using System.Threading;
using System.Linq;
using AFrame.Web.Controls;
using AFrame.Web;

namespace AFrame.Web.Tests.Features.StaleElementReference
{
    [TestClass]
    public class StaleElementReferenceTests : BaseTest
    {
        [TestMethod]
        public void HightlightStaleReferenceException()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);

            //Verify it throws a stale exception.
            Action action = () =>
            {
                //Get the control.
                var textCtrls = homePage.StaleReference.StaleTexts;

                var text1 = textCtrls.Last().Text;

                var textCtrl = homePage.StaleReference.CreateControl(".stale-ref:first-child");
                var text2 = textCtrl.Text;

                //Wait till it changes
                Thread.Sleep(2000);
            
                var x = textCtrls.Last().Text;
                var x2 = textCtrl.Text;

                var x3 = textCtrls.Last().Text;
                var x4 = textCtrl.Text;
            };

            ExceptionAssert.Throws<OpenQA.Selenium.StaleElementReferenceException>(action); 
        }

        [TestMethod]
        public void AlwaysSearchFixesStaleReferenceException()
        {
            try
            {
                Playback.AlwaysSearch = true;

                var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);

                //Get the control.
                var textCtrls = homePage.StaleReference.StaleTexts;

                var text1 = textCtrls.Last().Text;

                var textCtrl = homePage.StaleReference.CreateControl(".stale-ref:first-child");
                var text2 = textCtrl.Text;

                //Wait till it changes
                Thread.Sleep(2000);

                //Verify it doesn't throw a stale exception.
                Assert.AreEqual("I will go stale", textCtrls.Last().Text);
                Assert.AreEqual("I will go stale", textCtrl.Text);
            }
            finally
            {
                Playback.AlwaysSearch = false;
            }
        }

        [TestMethod]
        public void StaleReferenceEdgeCasesThrowsStaleReference()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);

            Action action = () =>
            {
                //Get the control.
                var textCtrls = homePage.CreateControls(".stale-ref").ToList();
                var text1 = textCtrls.Last().Text;

                var textCtrl = homePage.StaleReference.CreateControl(".stale-ref:first-child");
                var text2 = textCtrl.Text;

                var x = homePage.StaleReference.CreateControl(".stale-ref:first-child");
                var y = x.Text;

                for (int i = 0; i < 50; i++)
                {
                    //Verify it doesn't throw a stale exception.
                    Assert.AreEqual("I will go stale", textCtrls.ElementAt(new Random().Next(0, 8)).Text);
                    Assert.AreEqual("I will go stale", textCtrl.Text);
                }
            };

            ExceptionAssert.Throws<OpenQA.Selenium.StaleElementReferenceException>(action); 
        }

        [TestMethod]
        public void StaleReferenceEdgeCasesFixedByGlobalAlwaysSearch()
        {
            try
            {
                Playback.AlwaysSearch = true;

                var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);

                //Get the control.
                var textCtrls = homePage.CreateControls(".stale-ref");
                var text1 = textCtrls.Last().Text;

                var textCtrl = homePage.StaleReference.CreateControl(".stale-ref:first-child");
                var text2 = textCtrl.Text;

                for (int i = 0; i < 50; i++)
                {
                    //Verify it doesn't throw a stale exception.
                    Assert.AreEqual("I will go stale", textCtrls.ElementAt(new Random().Next(0, 8)).Text);
                    Assert.AreEqual("I will go stale", textCtrl.Text);
                }
            }
            finally
            {
                Playback.AlwaysSearch = false;
            }
        }

        [TestMethod]
        public void StaleReferenceEdgeCasesFixedByLocalAlwaysSearch()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);

            //Get the control.
            var textCtrls = homePage.CreateControls<WebControl>(new SearchPropertyCollection(new [] { new SearchProperty(WebControl.SearchNames.JQuerySelector, ".stale-ref"),
                                                                                                      new SearchProperty(WebControl.SearchNames.AlwaysSearch, "true") }));
            var text1 = textCtrls.Last().Text;

            var textCtrl = homePage.StaleReference.CreateControl<WebControl>(WebControl.SearchNames.JQuerySelector, ".stale-ref:first-child",
                                                                             WebControl.SearchNames.AlwaysSearch, "true");
            var text2 = textCtrl.Text;

            for (int i = 0; i < 50; i++)
            {
                //Verify it doesn't throw a stale exception.
                Assert.AreEqual("I will go stale", textCtrls.ElementAt(new Random().Next(0, 8)).Text);
                Assert.AreEqual("I will go stale", textCtrl.Text);
            }
        }
    }
}