using MainFrame.Web.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Web.Tests.TestApp
{
    public class Race : WebControl
    {
        public IEnumerable<Item> Items { get { return this.CreateControls<Item>(".item"); } }

        public Race(Context context)
            : base(context)
        { }
    }
}
