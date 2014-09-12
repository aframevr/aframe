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
    [DeploymentItem("Wpf.exe")]
    [DeploymentItem("WinForms.exe")]
    public class BaseTest
    {
        public readonly string WinFormsAppPath = "winforms.exe";
        public readonly string WpfAppPath = "wpf.exe";

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