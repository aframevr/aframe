using Mainframe.Web.Controls;
using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mainframe.Pages
{
    public class Result : WebControl
    {
        public WebControl Link { get { return this.CreateControl<WebControl>(By.CssSelector("a")); } }

        public Result(Context context)
            : base(context)
        {

        }
    }
}
