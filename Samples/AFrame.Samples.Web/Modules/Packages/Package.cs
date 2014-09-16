using AFrame.Web;
using AFrame.Web.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Web.Sample.NuGet.Modules.Packages
{
    public class Package : WebControl
    {
        public string Name { get { return this.CreateControl(".package-list-header h1 a").Text; } }

        public Package(WebContext webContext)
            : base(webContext)
        { }
    }
}
