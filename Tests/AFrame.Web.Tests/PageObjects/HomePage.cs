using AFrame.Web.Controls;
using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Web.Tests.PageObjects
{
    public class HomePage : WebControl
    {
        public WebControl ContentChange { get { return this.CreateControl<WebControl>(".content-change"); } }

        public InsertedStuff InsertedStuff { get { return this.CreateControl<InsertedStuff>("div#insert-stuff-here"); } }

        public RemovedStuff RemovedStuff { get { return this.CreateControl<RemovedStuff>("#removed-stuff"); } }

        public FindOr FindOneMultiple { get { return this.CreateControl<FindOr>("#find-or"); } }

        public FindOrMultiple FindAllMultiple { get { return this.CreateControl<FindOrMultiple>("#find-or-multiple"); } }

        public IEnumerable<CrazyRace> FindCrazyMultiple { get { return this.CreateControls<CrazyRace>(".racex, .racey"); } }

        public IEnumerable<Race> Races { get { return this.CreateControls<Race>(".race"); } }

        public StaleReference StaleReference { get { return this.CreateControl<StaleReference>("#highlight-stale-reference"); } }
    }
}
