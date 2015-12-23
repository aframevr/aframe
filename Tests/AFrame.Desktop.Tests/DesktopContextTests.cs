using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.VisualStudio.TestTools.UITesting;
using AFrame.Desktop.Tests.Wpf.App;
using System.Diagnostics;

namespace AFrame.Desktop.Tests
{
    [CodedUITest]
    public class DesktopContextTests : BaseTest
    {
        [TestMethod]
        public void LaunchUsingProcessStartInfo()
        {
            var startInfo = new ProcessStartInfo(this.WpfAppPath);

            Assert.IsNotNull(this.Context);
            Assert.IsNull(this.Context.ApplicationUnderTest);

            var app = this.Context.Launch<WpfApp>(startInfo);

            Assert.IsNotNull(this.Context);
            Assert.IsNotNull(this.Context.ApplicationUnderTest);
        }

        [TestMethod]
        public void LaunchUsingFilename()
        {
            Assert.IsNotNull(this.Context);
            Assert.IsNull(this.Context.ApplicationUnderTest);

            var app = this.Context.Launch<WpfApp>(this.WpfAppPath);

            Assert.IsNotNull(this.Context);
            Assert.IsNotNull(this.Context.ApplicationUnderTest);
        }

        [TestMethod]
        public void LaunchUsingFilenameAlternativeFilename()
        {
            Assert.IsNotNull(this.Context);
            Assert.IsNull(this.Context.ApplicationUnderTest);

            var app = this.Context.Launch<WpfApp>(this.WpfAppPath + "x", this.WinFormsAppPath);

            Assert.IsNotNull(this.Context);
            Assert.IsNotNull(this.Context.ApplicationUnderTest);
        }

        [TestMethod]
        public void LaunchUsingFilenameAlternativeFilenameArgs()
        {
            Assert.IsNotNull(this.Context);
            Assert.IsNull(this.Context.ApplicationUnderTest);

            var app = this.Context.Launch<WpfApp>(this.WpfAppPath + "x", this.WinFormsAppPath, "-a -b");

            Assert.IsNotNull(this.Context);
            Assert.IsNotNull(this.Context.ApplicationUnderTest);
        }

        //[TestMethod]
        //public void LaunchUsingFilenameAlternativeFilenameArgsUsernamePasswordDomain()
        //{
        //    var secure = new System.Security.SecureString();
        //    secure.AppendChar('p');
        //    secure.AppendChar('a');
        //    secure.AppendChar('s');
        //    secure.AppendChar('s');
        //    secure.AppendChar('w');
        //    secure.AppendChar('o');
        //    secure.AppendChar('r');
        //    secure.AppendChar('d');

            //Assert.IsNotNull(this.Context);
            //Assert.IsNull(this.Context.ApplicationUnderTest);

        //    var app = this.Context.Launch<WpfApp>(this.WpfAppPath + "x", this.WinFormsAppPath, "-a -b", "jim", secure, "domain");

        //    Assert.IsNotNull(this.Context);
        //    Assert.IsNotNull(this.Context.ApplicationUnderTest);
        //}

        [TestMethod]
        public void LaunchFromProcess()
        {
            var process = Process.Start(this.WpfAppPath);

            Assert.IsNotNull(this.Context);
            Assert.IsNull(this.Context.ApplicationUnderTest);

            var app = this.Context.FromProcess<WpfApp>(process);

            Assert.IsNotNull(this.Context);
            Assert.IsNotNull(this.Context.ApplicationUnderTest);
        }
    }
}