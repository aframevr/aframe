using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mainframe.Web.Tests
{
    [TestClass]
    public class WaitTests : BaseTest
    {
        [TestMethod]
        public void SimpleWaitFor()
        {
            var ctrl = this.HomePage.InsertedStuff.IGotAdded;
            ctrl.WaitForCondition(x => x.Displayed, 11000);
            Assert.AreEqual("this got added via javascript after 10 seconds", ctrl.Text);
        }
    }
}
