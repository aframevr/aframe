using MainFrame.Web.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Linq;

namespace MainFrame.Web.Tests.Features.iFrames
{
    [TestClass]
    public class ExtractFrameDataTests
    {
        [TestMethod]
        public void CanExtractNameFromStringWithPreAndPost()
        {
            var jquery = ".blah [iframe='loginFrame'] #testing";

            var extracts = Helpers.ExtractiFrameData(jquery).ToList();

            Assert.AreEqual(2, extracts.Count());
            Assert.AreEqual(".blah ", extracts[0].jQuery);
            Assert.AreEqual("loginFrame", extracts[0].iFrameName);
            Assert.AreEqual(" #testing", extracts[1].jQuery);
            Assert.AreEqual("", extracts[1].iFrameName);
        }

        [TestMethod]
        public void CanExtractNameFromStringWithPre()
        {
            var jquery = ".blah [iFrame=loginframe]";

            var extracts = Helpers.ExtractiFrameData(jquery).ToList();

            Assert.AreEqual(1, extracts.Count());
            Assert.AreEqual(".blah ", extracts[0].jQuery);
            Assert.AreEqual("loginframe", extracts[0].iFrameName);
        }

        [TestMethod]
        public void CanExtractNameFromStringWithPost()
        {
            var jquery = "[iframe='loginFrame'] #testing";

            var extracts = Helpers.ExtractiFrameData(jquery).ToList();

            Assert.AreEqual(2, extracts.Count());
            Assert.AreEqual("", extracts[0].jQuery);
            Assert.AreEqual("loginFrame", extracts[0].iFrameName);
            Assert.AreEqual(" #testing", extracts[1].jQuery);
            Assert.AreEqual("", extracts[1].iFrameName);
        }
    }
}
