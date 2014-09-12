using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.VisualStudio.TestTools.UITesting;
using MainFrame.Desktop.Tests.Wpf.App;

namespace MainFrame.Desktop.Tests.Wpf.Features
{
    [CodedUITest]
    public class MouseTests : BaseTest
    {
        [TestMethod]
        public void CanClickButtons()
        {
            //Arrange
            var app = this.Context.Launch<WpfApp>(this.WpfAppPath);

            //Act
            app.ClickButton.Click();


            app.ClickButton.Click();
            app.ClickButton.Click();
            app.ClickButton.Click();

            //Assert
            Assert.AreEqual("4", app.ClickLabel.DisplayText);
        }
    }
}