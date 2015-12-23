using AFrame.Desktop.Controls.Win;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MSTestHacks;

namespace AFrame.Desktop.Tests.WinForms.Core
{
    [TestClass]
    public class ConstructorTests : BaseTest
    {
        public IEnumerable<string> AllControlNames
        {
            get
            {
                return this.AllControls.Select(x => x.Name);
            }
        }

        public IEnumerable<Type> AllControls
        {
            get
            {
                var allTypes = System.Reflection.Assembly.GetAssembly(typeof(DesktopContext)).GetTypes();
                return allTypes.Where(p => typeof(WinControl).IsAssignableFrom(p));
            }
        }

        [TestMethod]
        public void NumberOfWinControlsIsCorrect()
        {
            Assert.AreEqual(40, this.AllControls.Count());
        }

        [TestMethod]
        [DataSource("AFrame.Desktop.Tests.WinForms.Core.ConstructorTests.AllControlNames")]
        public void AllWinTypesHaveDefaultConstructor()
        {
            var controlName = this.TestContext.GetRuntimeDataSourceObject<string>();
            var type = this.AllControls.Single(x => x.Name == controlName);
            var ctr = type.GetConstructor(Type.EmptyTypes);

            Assert.IsNotNull(ctr, "Type does not have default constructor: " + type.Name);
        }

        [TestMethod]
        [DataSource("AFrame.Desktop.Tests.WinForms.Core.ConstructorTests.AllControlNames")]
        public void AllWinTypesHaveConstructorWithContext()
        {
            var controlName = this.TestContext.GetRuntimeDataSourceObject<string>();
            var type = this.AllControls.Single(x => x.Name == controlName);
            var ctr = type.GetConstructor(new [] { typeof(DesktopContext) });

            Assert.IsNotNull(ctr, "Type does not have constructor with type 'DesktopContext': " + type.Name);
        }
    }
}
