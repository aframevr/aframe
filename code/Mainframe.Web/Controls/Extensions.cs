using OpenQA.Selenium;
using OpenQA.Selenium.Support.PageObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mainframe.Web.Controls
{
    public static class Extensions
    {
        public static T CreateControl<T>(this WebControl control, By by) where T : WebControl
        {
            //Each time we create a control, we add the selector of its parent.
            var allSearchParameters = new SearchParameterCollection();
            allSearchParameters.Add(control.Context.SearchParameters);
            allSearchParameters.Add(by.FromBy());

            var context = new WebContext(control.Context.Driver, control.Context, allSearchParameters);
            return (T)Activator.CreateInstance(typeof(T), context);
        }

        public static IEnumerable<T> CreateControls<T>(this WebControl control, By by) where T : WebControl
        {
            //Each time we create a control, we add the selector of its parent.
            var allSearchParameters = new SearchParameterCollection();
            allSearchParameters.Add(control.Context.SearchParameters);
            allSearchParameters.Add(by.FromBy());

            //Each time we create a control, we add the selector of its parent.
            var context = new WebContext(control.Context.Driver, control.Context.ParentContext /* Skip to parent */, allSearchParameters);
            return ((WebControlCollection<T>)Activator.CreateInstance(typeof(WebControlCollection<T>), context, by.FromBy())).AsEnumerable();
        }

        internal static T CreateControlItem<T>(this WebContext context, IEnumerable<SearchParameter> searchParameters) where T : WebControl
        {
            var wrapperSearchParameters = new SearchParameterCollection();
            wrapperSearchParameters.Add(searchParameters);

            //Each time we create a control, we add the selector of its parent.
            var newContext = new WebContext(context.Driver, context.ParentContext, wrapperSearchParameters);
            return (T)Activator.CreateInstance(typeof(T), newContext);
        }

        internal static By ToBy(this IEnumerable<SearchParameter> searchParameters)
        {
            /* This could be 1 control or 20 controls. So need to loop through all the controls
             * and build up a list of by's.
            */

            var bys = new List<By>();
            foreach (var searchParameter in searchParameters)
            {
                switch (searchParameter.Name)
                {
                    case "CssSelector":
                        {
                            bys.Add(By.CssSelector(searchParameter.Value));
                            break;
                        }
                    case "XPath":
                        {
                            bys.Add(By.XPath(searchParameter.Value));
                            break;
                        }
                    default:
                        {
                            //Not a supported search property for the web.
                            break;
                        }
                }
            }

            if (bys.Count > 1)
                throw new Exception("Mainframe only supports 1 by at a time.");

            return bys.First();
        }

        internal static By ToAbsoluteBy(this SearchParameterCollection searchParameterCollection)
        {
            /* This could be 1 control or 20 controls. So need to loop through all the controls
             * and build up a list of by's.
            */

            var bys = new List<By>();
            foreach (var searchParameters in searchParameterCollection)
            {
                bys.Add(searchParameters.ToBy());
            }

            return new ByChained(bys.ToArray());
        }

        internal static IEnumerable<SearchParameter> FromBy(this By by)
        {
            var cssKey = "By.CssSelector: ";
            var xpathKey = "By.XPath: ";
            var byString = by.ToString();
            SearchParameter searchParameter = null;
            if (byString.StartsWith(cssKey))
            {
                var original = byString.Replace(cssKey, "");
                searchParameter = new SearchParameter("CssSelector", original);
            }
            else if (byString.StartsWith(xpathKey))
            {
                var original = byString.Replace(xpathKey, "");
                searchParameter = new SearchParameter("XPath", original);
            }
            else
            {
                throw new Exception("Mainframe only supports By.CssSelector & By.XPath. Currently using: " + byString);
            }

            return new List<SearchParameter> { searchParameter };
        }
    }
}