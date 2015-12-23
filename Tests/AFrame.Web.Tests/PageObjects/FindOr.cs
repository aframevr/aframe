using AFrame.Web.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Web.Tests.PageObjects
{
    public class FindOr : WebControl
    {
        public WebControl InnerControl { get { return this.CreateControl<WebControl>(".find-1, .find-2"); } }

        public FindOr(WebContext context)
            : base(context)
        { }
    }
}
