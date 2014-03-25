using OpenQA.Selenium;
using OpenQA.Selenium.Support.PageObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mainframe.Web.Controls
{
    public class WebControlCollection<T> : ControlCollection<T> where T : WebControl
    {
        public new WebContext Context { get { return base.Context as WebContext; } }
        protected By _by { get { return this._searchParameters.ToBy(); } }

        public WebControlCollection(WebContext context, IEnumerable<SearchParameter> searchParameters)
            : base(context, Technology.Web, searchParameters)
        { }

        public override object RawFind()
        {
            var cssKey = "By.CssSelector: ";
            var xpathKey = "By.XPath: ";
            var byString = this._by.ToString();
            var indexedElements = new List<T>();

            if (byString.StartsWith(cssKey))
            {
                var original = byString.Replace(cssKey, "");
                var strToFormat = original + ":nth-child({0})";

                var elements = this.Context.Driver.FindElements(this._by); // all the bys...
                for (int i = 0; i < elements.Count(); i++)
                {

                    var indexedBy = By.CssSelector(string.Format(strToFormat, i + 1));
                    indexedElements.Add(this.Context.CreateControlItem<T>(indexedBy.FromBy()));
                }
            }
            else if (byString.StartsWith(xpathKey))
            {
                var original = byString.Replace(xpathKey, "");
                var strToFormat = original + "[{0}]";

                var elements = this.Context.Driver.FindElements(this._by);
                for (int i = 0; i < elements.Count(); i++)
                {
                    var indexedBy = By.XPath(string.Format(strToFormat, i));
                    indexedElements.Add(this.Context.CreateControlItem<T>(indexedBy.FromBy()));
                }
            }
            else
            {
                throw new Exception("Mainframe only supports By.CssSelector & By.XPath. Currently using: " + byString);
            }

            return indexedElements;
        }
    }
}
