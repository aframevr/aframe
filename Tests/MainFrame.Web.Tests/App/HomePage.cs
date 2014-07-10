using MainFrame.Web.Controls;
using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Web.Tests.App
{
    public class HomePage : WebControl
    {
        public WebControl ContentChange;

        public InsertedStuff InsertedStuff { get { return this.CreateControl<InsertedStuff>("div#insert-stuff-here"); } }

        public RemovedStuff RemovedStuff { get { return this.CreateControl<RemovedStuff>("#removed-stuff"); } }

        public FindOr FindOneMultiple { get { return this.CreateControl<FindOr>("#find-or"); } }

        public FindOrMultiple FindAllMultiple { get { return this.CreateControl<FindOrMultiple>("#find-or-multiple"); } }

        public IEnumerable<CrazyRace> FindCrazyMultiple { get { return this.CreateControls<CrazyRace>(".racex, .racey"); } }

        public IEnumerable<Race> Races { get { return this.CreateControls<Race>(".race"); } }

        public HomePage(WebContext context)
            : base(context)
        {
            this.ContentChange = this.CreateControl<WebControl>(".content-change");
        }
    }
}
