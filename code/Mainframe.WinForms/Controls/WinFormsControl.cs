using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mainframe.WinForms.Controls
{
    public class WinFormsControl : Control
    {
        public WinFormsControl(IContext context)
            : base(context, Technology.WinForms)
        { }
    }
}
