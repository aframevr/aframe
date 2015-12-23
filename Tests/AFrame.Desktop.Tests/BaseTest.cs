using Microsoft.VisualStudio.TestTools.UITesting;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Tests
{
    [CodedUITest]
    [DeploymentItem("AFrame.Wpf.TestApp.exe")]
    [DeploymentItem("AFrame.WinForms.TestApp.exe")]
    public class BaseTest : MSTestHacks.TestBase
    {
        public readonly string WinFormsAppPath = "AFrame.WinForms.TestApp.exe";
        public readonly string WpfAppPath = "AFrame.Wpf.TestApp.exe";

        private DesktopContext _context;
        public DesktopContext Context
        {
            get
            {
                if (this._context == null)
                    this._context = new DesktopContext();

                return this._context;
            }
        }

        [TestCleanup]
        public void TestCleanup()
        {
            if (this._context != null)
            {
                this._context.Dispose();
            }
        }
    }
}