using Mainframe.Web.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mainframe.Web.Tests.TestApp
{
    public class FindOrMultiple : WebControl
    {
        public IEnumerable<WebControl> MultipleControls { get { return this.CreateControls<WebControl>(".find-1, .find-2"); } }

        public FindOrMultiple(Context context)
            : base(context)
        { }
    }
}
