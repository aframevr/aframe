using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Web.Sample.NuGet.Framework
{
    public static class UrlHelper
    {
        public static string SiteUrl { get { return "https://www.nuget.org"; } }

        public static string PackagesUrl { get { return SiteUrl + "/packages"; } }
    }
}
