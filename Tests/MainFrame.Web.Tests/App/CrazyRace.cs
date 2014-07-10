using MainFrame.Web.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Web.Tests.App
{
    public class CrazyRace : WebControl
    {
        public IEnumerable<Item> Items { get { return this.CreateControls<Item>(".item, .other-item"); } }

        public CrazyRace(Context context)
            : base(context)
        { }
    }
}
