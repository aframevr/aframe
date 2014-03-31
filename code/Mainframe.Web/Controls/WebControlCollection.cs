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

        public WebControlCollection(WebContext context, IEnumerable<SearchParameter> searchParameters)
            : base(context, Technology.Web, searchParameters)
        { }

        protected override object RawFind()
        {
            //Find the absolute selector.
            var absSelector = this.Context.SearchParameters.ToAbsoluteSelector();

            //Get all the elements.
            var elements = this.Context.JQueryFindElements();

            //Loop through them adding the index.
            var indexedElements = new List<T>();
            var strToFormat = absSelector + ":eq({0})";
            for (int i = 0; i < elements.Count(); i++)
            {
                var indexedSelector = string.Format(strToFormat, i);
                var searchParameters = new List<SearchParameter>
                {
                    new SearchParameter(WebControl.SearchProperties.JQuerySelector, indexedSelector)
                };
                indexedElements.Add(this.CreateControlItem<T>(searchParameters));
            }
           
            return indexedElements;
        }

        protected override T2 CreateControlItem<T2>(IEnumerable<SearchParameter> searchParameters)
        {
            var wrapperSearchParameters = new SearchParameterCollection();
            wrapperSearchParameters.Add(searchParameters);

            //Each time we create a control, we add the selector of its parent.
            var newContext = new WebContext(this.Context.Driver, this.Context.ParentContext, wrapperSearchParameters);
            return (T2)Activator.CreateInstance(typeof(T2), newContext);
        }
    }
}
