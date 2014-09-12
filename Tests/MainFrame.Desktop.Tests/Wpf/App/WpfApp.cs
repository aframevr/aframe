using MainFrame.Core;
using MainFrame.Desktop.Controls.Win;
using MainFrame.Desktop.Controls.Wpf;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Desktop.Tests.Wpf.App
{
    public class WpfApp : WpfWindow
    {
        public WpfButton ClickButton { get; private set; }

        public WpfText ClickLabel { get; private set; }

        public WpfApp(IContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.Name, "MainWindow");
            
            this.ClickButton = this.CreateControl<WpfButton>("ClicksBtn");
            this.ClickLabel = this.CreateControl<WpfText>("ClicksLbl");
        }
    }
}
