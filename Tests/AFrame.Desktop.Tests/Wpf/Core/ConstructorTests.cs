using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MSTestHacks;
using AFrame.Desktop.Controls.Wpf;

namespace AFrame.Desktop.Tests.Wpf.Core
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
                return allTypes.Where(p => typeof(WpfControl).IsAssignableFrom(p));
            }
        }

        [TestMethod]
        public void NumberOfWpfControlsIsCorrect()
        {
            Assert.AreEqual(36, this.AllControls.Count());
        }

        [TestMethod]
        [DataSource("AFrame.Desktop.Tests.Wpf.Core.ConstructorTests.AllControlNames")]
        public void AllWpfTypesHaveDefaultConstructor()
        {
            var controlName = this.TestContext.GetRuntimeDataSourceObject<string>();
            var type = this.AllControls.Single(x => x.Name == controlName);
            var ctr = type.GetConstructor(Type.EmptyTypes);

            Assert.IsNotNull(ctr, "Type does not have default constructor: " + type.Name);
        }

        [TestMethod]
        [DataSource("AFrame.Desktop.Tests.Wpf.Core.ConstructorTests.AllControlNames")]
        public void AllWpfTypesHaveConstructorWithContext()
        {
            var controlName = this.TestContext.GetRuntimeDataSourceObject<string>();
            var type = this.AllControls.Single(x => x.Name == controlName);
            var ctr = type.GetConstructor(new[] { typeof(DesktopContext) });

            Assert.IsNotNull(ctr, "Type does not have constructor with type 'DesktopContext': " + type.Name);
        }
    }
}
