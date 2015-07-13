using AFrame.Web.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Web.Tests.PageObjects
{
    public class InsertedStuff : WebControl
    {
        public WebControl IGotAdded { get { return this.CreateControl<WebControl>(".i-got-added"); } }

        public InsertedStuff(WebContext context)
            : base(context)
        { }
    }
}
