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

        public WinClient(DesktopContext context, DesktopControl parent)
            : base(context, parent)
        {
            this.SearchProperties.Add(WinControl.PropertyNames.ControlType, "Client");
        }

        public new class PropertyNames : WinControl.PropertyNames
        {
        }
    }
}
