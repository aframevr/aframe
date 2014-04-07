using Mainframe.Web.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mainframe.Web.Tests.TestApp
{
    public class RemovedStuff : WebControl
    {
        public WebControl IGotRemoved { get { return this.CreateControl<WebControl>("b.remove-me"); } }

        public RemovedStuff(Context context)
            : base(context)
        { }
    }
}
