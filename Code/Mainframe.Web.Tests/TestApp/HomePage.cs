using Mainframe.Web.Controls;
using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mainframe.Web.Tests.TestApp
{
    public class HomePage : WebControl
    {
        public WebControl ContentChange;

        public InsertedStuff InsertedStuff { get { return this.CreateControl<InsertedStuff>("div#insert-stuff-here"); } }

        public RemovedStuff RemovedStuff { get { return this.CreateControl<RemovedStuff>("#removed-stuff"); } }

        public IEnumerable<Race> Races { get { return this.CreateControls<Race>(".race"); } }

        public HomePage(Context context)
            : base(context)
        {
            this.ContentChange = this.CreateControl<WebControl>(".content-change");
        }
    }
}
