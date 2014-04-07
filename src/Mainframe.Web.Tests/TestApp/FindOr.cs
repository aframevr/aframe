using Mainframe.Web.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mainframe.Web.Tests.TestApp
{
    public class FindOr : WebControl
    {
        public WebControl InnerControl { get { return this.CreateControl<WebControl>(".find-1, .find-2"); } }

        public FindOr(Context context)
            : base(context)
        { }
    }
}
