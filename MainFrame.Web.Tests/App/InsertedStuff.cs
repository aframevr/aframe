using MainFrame.Web.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Web.Tests.App
{
    public class InsertedStuff : WebControl
    {
        public WebControl IGotAdded { get { return this.CreateControl<WebControl>(".i-got-added"); } }

        public InsertedStuff(Context context)
            : base(context)
        { }
    }
}
