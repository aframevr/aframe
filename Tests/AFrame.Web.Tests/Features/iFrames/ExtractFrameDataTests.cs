using AFrame.Web.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Linq;

namespace AFrame.Web.Tests.Features.iFrames
{
    [TestClass]
    public class ExtractFrameDataTests
    {
        [TestMethod]
        public void CanExtractNameFromStringWithPreAndPost()
        {
            var jquery = ".blah [iframe=iframe[name='.loginFrame #id']] #testing";

            var extracts = Helpers.ExtractiFrameData(jquery).ToList();

            Assert.AreEqual(2, extracts.Count());
            Assert.AreEqual(".blah ", extracts[0].jQuery);
            Assert.AreEqual("iframe[name='.loginFrame #id']", extracts[0].jQuerySelector);
            Assert.AreEqual(" #testing", extracts[1].jQuery);
            Assert.AreEqual("", extracts[1].jQuerySelector);
        }

        [TestMethod]
        public void CanExtractNameFromStringWithPre()
        {
            var jquery = ".blah [iFrame='.loginframe']";

            var extracts = Helpers.ExtractiFrameData(jquery).ToList();

            Assert.AreEqual(1, extracts.Count());
            Assert.AreEqual(".blah ", extracts[0].jQuery);
            Assert.AreEqual(".loginframe", extracts[0].jQuerySelector);
        }

        [TestMethod]
        public void CanExtractNameFromStringWithPostNoQuotes()
        {
            var jquery = "[iframe=#loginFrame] #testing";

            var extracts = Helpers.ExtractiFrameData(jquery).ToList();

            Assert.AreEqual(2, extracts.Count());
            Assert.AreEqual("", extracts[0].jQuery);
            Assert.AreEqual("#loginFrame", extracts[0].jQuerySelector);
            Assert.AreEqual(" #testing", extracts[1].jQuery);
            Assert.AreEqual("", extracts[1].jQuerySelector);
        }

        [TestMethod]
        public void CanExtractNameFromStringWithPostQuotes()
        {
            var jquery = "[iframe='#loginFrame'] #testing";

            var extracts = Helpers.ExtractiFrameData(jquery).ToList();

            Assert.AreEqual(2, extracts.Count());
            Assert.AreEqual("", extracts[0].jQuery);
            Assert.AreEqual("#loginFrame", extracts[0].jQuerySelector);
            Assert.AreEqual(" #testing", extracts[1].jQuery);
            Assert.AreEqual("", extracts[1].jQuerySelector);
        }

        [TestMethod]
        public void CanExtractNameFromStringWithIframeAsDifferentCase()
        {
            var jquery = "[iFraMe='#loginFrame #blah'] #testing";

            var extracts = Helpers.ExtractiFrameData(jquery).ToList();

            Assert.AreEqual(2, extracts.Count());
            Assert.AreEqual("", extracts[0].jQuery);
            Assert.AreEqual("#loginFrame #blah", extracts[0].jQuerySelector);
            Assert.AreEqual(" #testing", extracts[1].jQuery);
            Assert.AreEqual("", extracts[1].jQuerySelector);
        }
    }
}
