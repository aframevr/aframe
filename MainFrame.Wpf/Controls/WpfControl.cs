using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Wpf.Controls
{
    public class WpfControl : Control
    {
        public WpfControl(IContext context)
            : base(context, Technology.Wpf)
        { }
    }
}
