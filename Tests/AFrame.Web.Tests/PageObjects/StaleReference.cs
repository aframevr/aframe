using AFrame.Web.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Web.Tests.PageObjects
{
    public class StaleReference : WebControl
    {
        public IEnumerable<WebControl> StaleTexts { get { return this.CreateControls<WebControl>(".stale-ref"); } }

        public StaleReference(WebContext context)
            : base(context)
        { }
    }
}
