using MainFrame.Web.Tests.App;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Diagnostics;

namespace MainFrame.Web.Tests.Features.WaitUntil
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
            Assert.IsTrue(stoppy.ElapsedMilliseconds < 500, "Waited " + stoppy.Elapsed);
        }

        [TestMethod]
        public void WaitUntilExists()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);
            var ctrl = homePage.InsertedStuff.IGotAdded;
            var stoppy = Stopwatch.StartNew();
            Assert.IsTrue(ctrl.WaitUntilExists());
            Assert.IsTrue(stoppy.ElapsedMilliseconds > 9000);
            Assert.IsTrue(stoppy.ElapsedMilliseconds < 11000);
        }

        [TestMethod]
        public void WaitUntilCondition()
        {
            var homePage = this.Context.NavigateTo<HomePage>(this.TestAppUrl);
            var ctrl = homePage.InsertedStuff.IGotAdded;
            var stoppy = Stopwatch.StartNew();
            Assert.IsTrue(ctrl.WaitUntil(x => x.Text == "this got added via javascript after 10 seconds"));
            Assert.IsTrue(stoppy.ElapsedMilliseconds > 9000);
            Assert.IsTrue(stoppy.ElapsedMilliseconds < 11000);
        }
    }
}
