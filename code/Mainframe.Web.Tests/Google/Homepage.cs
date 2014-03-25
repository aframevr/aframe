using Mainframe.Web.Controls;
using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mainframe.Pages
{
    public class Homepage : WebControl
    {
        public IEnumerable<Result> Results;
        public WebControl SearchField { get { return this.CreateControl<WebControl>(By.CssSelector("input[name=q]")); } }

        public Homepage(Context context)
            : base(context)
        {
            this.Results = this.CreateControls<Result>(By.CssSelector(".g"));
        }
    }
}
