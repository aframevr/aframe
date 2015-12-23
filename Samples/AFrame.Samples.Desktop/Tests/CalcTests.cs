using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using AFrame.Desktop;
using AFrame.Desktop.Controls.Win;
using Microsoft.VisualStudio.TestTools.UITesting;

namespace AFrame.Samples.Desktop.Tests
{
    [CodedUITest]
    public class CalcTests
    {
        [TestMethod]
        public void TwoPlusTwoEqualsFour_QuickAndDirty()
        {
            var calculator = new DesktopContext().Launch<WinWindow>(@"C:\Windows\system32\calc.exe");
            calculator.SearchProperties.Add(WinWindow.PropertyNames.Name, "Calculator");

            var twoBtn = calculator.CreateControl<WinButton>("2");
            var plusBtn = calculator.CreateControl<WinButton>("Add");
            var equalsBtn = calculator.CreateControl<WinButton>("Equals");
            var resultTxt = calculator.CreateControl<WinText>("Result");

            twoBtn.Click();
            plusBtn.Click();
            twoBtn.Click();
            equalsBtn.Click();

            Assert.AreEqual("4", resultTxt.DisplayText);
        }
    }
}