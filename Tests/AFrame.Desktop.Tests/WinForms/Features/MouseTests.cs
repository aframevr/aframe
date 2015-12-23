using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using AFrame.Desktop.Tests.WinForms.App;
using Microsoft.VisualStudio.TestTools.UITesting;

namespace AFrame.Desktop.Tests.WinForms.Features
{
    [CodedUITest]
    public class MouseTests : BaseTest
    {
        [TestMethod]
        public void CanClickButtons()
        {
            //Arrange
            var app = this.Context.Launch<WinFormsApp>(this.WinFormsAppPath);

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