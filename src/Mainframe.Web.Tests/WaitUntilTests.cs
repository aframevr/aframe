using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Web.Tests
{
    [TestClass]
    public class WaitUntilTests : BaseTest
    {
        [TestMethod]
        public void WaitUntilNotExists()
        {
            var ctrl = this.HomePage.InsertedStuff.IGotAdded;
            var stoppy = Stopwatch.StartNew();
            Assert.IsTrue(ctrl.WaitUntilNotExists());
            Assert.IsTrue(stoppy.ElapsedMilliseconds < 500);
        }

        [TestMethod]
        public void WaitUntilExists()
        {
            var ctrl = this.HomePage.InsertedStuff.IGotAdded;
            var stoppy = Stopwatch.StartNew();
            Assert.IsTrue(ctrl.WaitUntilExists());
            Assert.IsTrue(stoppy.ElapsedMilliseconds > 9000);
            Assert.IsTrue(stoppy.ElapsedMilliseconds < 11000);
        }

        [TestMethod]
        public void WaitUntilCondition()
        {
            var ctrl = this.HomePage.InsertedStuff.IGotAdded;
            var stoppy = Stopwatch.StartNew();
            Assert.IsTrue(ctrl.WaitUntil(x => x.Text == "this got added via javascript after 10 seconds"));
            Assert.IsTrue(stoppy.ElapsedMilliseconds > 9000);
            Assert.IsTrue(stoppy.ElapsedMilliseconds < 11000);
        }
    }
}
