using AFrame.Web;
using AFrame.Web.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Web.Sample.NuGet.Modules.Home
{
    public class HomePage : WebControl
    {
        private WebControl SearchBox { get { return this.CreateControl("#searchBoxInput"); } }
        private WebControl SearchBtn { get { return this.CreateControl("#searchBoxSubmit"); } }

        public HomePage(WebContext context)
            : base(context)
        { }

        public void SearchFor(string text)
        {
            this.SearchBox.SendKeys(text);
            this.SearchBtn.Click();
        }
    }
}