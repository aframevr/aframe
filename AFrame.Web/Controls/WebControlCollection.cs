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

        public WebControlCollection(WebContext context, WebControl parent, SearchPropertyCollection searchProperties)
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

                    //Generate the absolute selector for this selector part.
                    var abs = Helpers.ToAbsoluteSelector(new WebControl(this.Context, this.Parent, new SearchPropertyCollection(new SearchProperty(WebControl.SearchNames.JQuerySelector, selector))));

                    //Find the elements. And put the index onto the selector part.
                    var elements = Helpers.JQueryFindElements(this.Context, abs);

                    var strToFormat = selector + ":eq({0})";
                    for (int e = 0; e < elements.Count(); e++)
                    {
                        var indexedSelector = string.Format(strToFormat, e);

                        //Add all search parameters bar the jquery selector.
                        var searchParameters = this.SearchProperties.Where(x => x.Name != WebControl.SearchNames.JQuerySelector).ToList();

                        //Add the new indexed jquery selector.
                        searchParameters.Add(new SearchProperty(WebControl.SearchNames.JQuerySelector, indexedSelector));

                        allElements.Add(this.CreateControlItem<T>(new SearchPropertyCollection(searchParameters)));
                    }
                }
            }

            return allElements;
        }

        protected override T2 CreateControlItem<T2>(SearchPropertyCollection searchProperties)
        {
            var instance = (T2)Activator.CreateInstance(typeof(T2), this.Parent.Context, this.Parent);
            instance.SearchProperties = searchProperties;
            return instance;
        }
    }
}
