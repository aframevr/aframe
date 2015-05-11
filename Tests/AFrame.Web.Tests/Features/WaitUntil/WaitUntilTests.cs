using AFrame.Web.Tests.PageObjects;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Diagnostics;

namespace AFrame.Web.Tests.Features.WaitUntil
{
    [TestClass]
    public class WaitUntilTests : BaseTest
    {
        [TestMethod]
        public void WaitUntilNotExists()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);
            var ctrl = homePage.InsertedStuff.IGotAdded;
            var stoppy = Stopwatch.StartNew();
            Assert.IsTrue(ctrl.WaitUntilNotExists());
            Assert.IsTrue(stoppy.ElapsedMilliseconds < 1000, "Waited " + stoppy.Elapsed);
        }

        [TestMethod]
        public void WaitUntilExists()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);
            var ctrl = homePage.InsertedStuff.IGotAdded;
            var stoppy = Stopwatch.StartNew();
            Assert.IsTrue(ctrl.WaitUntilExists());
            Assert.IsTrue(stoppy.ElapsedMilliseconds > 8000);
            Assert.IsTrue(stoppy.ElapsedMilliseconds < 12000);
        }

        [TestMethod]
        public void WaitUntilCondition()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);
            var ctrl = homePage.InsertedStuff.IGotAdded;
            var stoppy = Stopwatch.StartNew();
            Assert.IsTrue(ctrl.WaitUntil(x => x.Text == "this got added via javascript after 10 seconds"));
            Assert.IsTrue(stoppy.ElapsedMilliseconds > 8000);
            Assert.IsTrue(stoppy.ElapsedMilliseconds < 12000);
        }
    }
}
