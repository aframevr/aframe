using AFrame.Web;
using AFrame.Web.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Web.Sample.NuGet.Modules.Packages
{
    public class PackagesPage : WebControl
    {
        public IEnumerable<Package> Packages { get { return this.CreateControls<Package>("#searchResults .package"); } }

        public PackagesPage(WebContext webContext)
            : base(webContext)
        { }
    }
}