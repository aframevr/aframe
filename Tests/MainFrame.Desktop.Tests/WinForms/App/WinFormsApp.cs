using MainFrame.Core;
using MainFrame.Desktop.Controls.Win;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Desktop.Tests.WinForms.App
{
    public class WinFormsApp : WinWindow
    {
        public WinButton ClickButton { get; private set; }

        public WinText ClickLabel { get; private set; }

        public WinFormsApp(IContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.Name, "Form1");
            
            this.ClickButton = this.CreateControl<WinButton>(new [] { new SearchProperty(WinControl.PropertyNames.ControlName, "ClicksBtn")});
            this.ClickLabel = this.CreateControl<WinText>(new[] { new SearchProperty(WinControl.PropertyNames.ControlName, "ClicksLbl") });
        }
    }
}
