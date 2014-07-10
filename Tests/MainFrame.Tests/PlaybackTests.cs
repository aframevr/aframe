using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;

namespace MainFrame.Tests
{
    [TestClass]
    public class PlaybackTests
    {
        [TestMethod]
        public void Can_Add_To_Properties()
        {
            Playback.Properties["Testing"] = "Yay";

            Assert.AreEqual("Yay", Playback.Properties["Testing"]);
        }

        [TestMethod]
        public void DefaultSearchTimeout()
        {
            var expected = TimeSpan.FromSeconds(15);

            Assert.AreEqual(expected.TotalMilliseconds, Playback.SearchTimeout);
        }
    }
}