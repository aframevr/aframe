using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls.Win
{
    public class WinClient : WinControl
    {
        #region Properties

        #endregion

        public WinClient()
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Client");
        }

        public WinClient(DesktopContext context)
            : base(context)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Client");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
        }
    }
}
