using AFrame.Web.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Web.Tests.PageObjects
{
    public class RemovedStuff : WebControl
    {
        public WebControl IGotRemoved { get { return this.CreateControl<WebControl>("b.remove-me"); } }

        public RemovedStuff(WebContext context)
            : base(context)
        { }
    }
}
