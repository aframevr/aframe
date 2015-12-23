using AFrame.Core;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace AFrame.Web.Controls
{
    public class WebControlCollection<T> : ControlCollection<T> where T : WebControl
    {
        public new WebContext Context { get { return base.Context as WebContext; } }
        public new WebControl Parent { get { return base.Parent as WebControl; } }

        public WebControlCollection(WebContext context, WebControl parent, IEnumerable<SearchProperty> searchProperties)
            : base(context, Technology.Web, parent, searchProperties)
        { }

        protected override object RawFind()
        {
            var allElements = new List<T>();
            var jquerySelector = this.SearchProperties.SingleOrDefault(x => x.Name.Equals(WebControl.SearchNames.JQuerySelector, StringComparison.InvariantCultureIgnoreCase));
            if (jquerySelector != null)
            {
                /* Comma (or) support
                 * 
                 * Absolute Selector: .homepage
                 *   JQuery Selector: .find-1, .find-2 
                 *   Expected Result: .homepage .find-1, .homepage .find-2
                 */

                var selectorParts = jquerySelector.Value.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries).Select(x => x.Trim()).ToArray();
                for (int i = 0; i < selectorParts.Length; i++)
                {
                    var selector = selectorParts[i];

                    //Create a proxy to get the absolute selector.
                    var proxyWebControl = Control.CreateInstance<T>(this.Context, this.Parent);
                    proxyWebControl.SearchProperties.Add(WebControl.SearchNames.JQuerySelector, selector);
                    
                    //Get the absolute selector of the proxy control.
                    var absoluteSelector = Helpers.ToAbsoluteSelector(proxyWebControl);

                    //Find all the elements.
                    var elements = Helpers.JQueryFindElements(this.Context, absoluteSelector);

                    //For each element found - append the index selector  
                    var strToFormat = selector + ":eq({0})";
                    for (int e = 0; e < elements.Count(); e++)
                    {
                        var indexedSelector = string.Format(strToFormat, e);

                        //Get all search parameters except for the jQuery selector.
                        var searchParameters = this.SearchProperties.Where(x => x.Name != WebControl.SearchNames.JQuerySelector).ToList();

                        //Add the new indexed jQuery selector.
                        searchParameters.Add(new SearchProperty(WebControl.SearchNames.JQuerySelector, indexedSelector));

                        //Add the indexed element to the final return array.
                        allElements.Add(this.CreateControlItem<T>(searchParameters));
                    }
                }
            }

            return allElements;
        }

        protected override T2 CreateControlItem<T2>(IEnumerable<SearchProperty> searchProperties)
        {
            var instance = Control.CreateInstance<T2>(this.Parent.Context, this.Parent);
            instance.SearchProperties.AddRange(searchProperties);
            return instance;
        }
    }
}
