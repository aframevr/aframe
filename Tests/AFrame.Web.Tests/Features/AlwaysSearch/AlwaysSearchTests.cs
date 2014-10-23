using AFrame.Core;
using AFrame.Web.Controls;
using AFrame.Web.Tests.PageObjects;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;

namespace AFrame.Web.Tests.Features.AlwaysSearch
{
    [TestClass]
    public class AlwaysSearchTests : BaseTest
    {
        [TestMethod]
        public void GlobalAlwaysSearchOffDoesntAlwaysSearch()
        {
            var searchParams = new[] 
            { 
                new SearchProperty(name: WebControl.SearchNames.JQuerySelector, value: ".always", searchOperator: SearchOperator.EqualTo),
            };

            var homePage = this.Context.NavigateTo(this.TestAppUrl);
            var control = homePage.CreateControl<WebControl>(searchParams);

            var ctrl1 = control.RawControl;
            var ctrl2 = control.RawControl;

            Assert.AreSame(ctrl1, ctrl2);
        }

        [TestMethod]
        public void GlobalAlwaysSearchOnShouldAlwaysSearch()
        {
            try
            {
                Playback.AlwaysSearch = true;

                var searchParams = new[] 
                { 
                    new SearchProperty(name: WebControl.SearchNames.JQuerySelector, value: ".always", searchOperator: SearchOperator.EqualTo),
                };

                var homePage = this.Context.NavigateTo(this.TestAppUrl);
                var control = homePage.CreateControl<WebControl>(searchParams);

                var ctrl1 = control.RawControl;
                var ctrl2 = control.RawControl;

                Assert.AreNotSame(ctrl1, ctrl2);
            }
            finally
            {
                Playback.AlwaysSearch = false;
            }
        }

        [TestMethod]
        public void SingleControlAlwaysSearchOnShouldAlwaysSearch()
        {
            var homePage = this.Context.NavigateTo(this.TestAppUrl);
            var control = homePage.CreateControl<WebControl>(WebControl.SearchNames.JQuerySelector, ".always",
                                                             WebControl.SearchNames.AlwaysSearch, "");

            var ctrl1 = control.RawControl;
            var ctrl2 = control.RawControl;

            Assert.AreNotSame(ctrl1, ctrl2);
        }

        [TestMethod]
        public void SingleControlAlwaysSearchOffDoesntAlwaysSearch()
        {
            var homePage = this.Context.NavigateTo(this.TestAppUrl);
            var control = homePage.CreateControl<WebControl>(WebControl.SearchNames.JQuerySelector, ".always");

            var ctrl1 = control.RawControl;
            var ctrl2 = control.RawControl;

            Assert.AreSame(ctrl1, ctrl2);
        }
    }
}