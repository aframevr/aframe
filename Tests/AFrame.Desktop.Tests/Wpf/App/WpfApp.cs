using AFrame.Core;
using AFrame.Desktop.Controls;
using AFrame.Desktop.Controls.Win;
using AFrame.Desktop.Controls.Wpf;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Tests.Wpf.App
{
    public class WpfApp : WpfWindow
    {
        public WpfButton ClickButton { get; private set; }

        public WpfText ClickLabel { get; private set; }

        public WpfApp(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WpfControl.PropertyNames.Name, "MainWindow");
            
            this.ClickButton = this.CreateControl<WpfButton>("ClicksBtn");
            this.ClickLabel = this.CreateControl<WpfText>("ClicksLbl");
        }
    }
}
