using AFrame.Core;
using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace AFrame.Web.Controls
{
    public class Helpers
    {
        public static IEnumerable<iFrameData> ExtractiFrameData(string jquery)
        {
            var list = new List<iFrameData>();
            /*
             * Extract a list of iFrame id's and their jQuery parts.
             * 
             * E.g. #firstid [iframe='aFrame'] #secondId [iframe='loginFrame'] .inner-contents-of-frame
             * 
             * iFrames: aFrame | loginFrame | null
             *  jQuery: #firstid  | #secondId  | .inner-contents-of-frame
             * 
            */

            var regex = @"\[iframe=.[\w\-]*.\]";

            var iFrames = Regex.Matches(jquery, regex, RegexOptions.IgnoreCase);
            var jQueries = Regex.Split(jquery, regex, RegexOptions.IgnoreCase);
            for (int i = 0; i < jQueries.Count(); i++)
            {
                var iFrame = (iFrames.Count == i) ? "" : iFrames[i].Value;
                var iFrameName = iFrame;
                var stuffToStrip = new string[] { @"[", @"]", @"'", @"iframe=" };
                foreach (var stuff in stuffToStrip)
                {
                    iFrameName = Regex.Replace(iFrameName, Regex.Escape(stuff), "", RegexOptions.IgnoreCase);
                }

                var jQuery = jQueries[i];

                //Don't add a iFrame when both are empty.
                if (string.IsNullOrEmpty(iFrameName) && string.IsNullOrEmpty(jQuery))
                {
                    continue;
                }
                else
                {
                    list.Add(new iFrameData { iFrameName = iFrameName, jQuery = jQuery });
                }
            }

            return list;
        }

        public class iFrameData
        {
            public string iFrameName { get; set; }

            public string jQuery { get; set; }
        }

        public static string ToAbsoluteSelector(SearchPropertyStack searchPropertyStack)
        {
            var absoluteSelector = "";
            foreach (var searchProperties in searchPropertyStack)
            {
                var jquerySelector = searchProperties.SingleOrDefault(x => x.Name.Equals(WebControl.SearchNames.JQuerySelector, StringComparison.InvariantCultureIgnoreCase));
                if (jquerySelector != null)
                {
                    /* Comma (or) support
                     * 
                     * Absolute Selector: .homepage
                     *   JQuery Selector: .find-1, .find-2 
                     *   Expected Result: .homepage .find-1, .homepage .find-2
                     */

                    var selector = "";
                    var selectorParts = jquerySelector.Value.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries).Select(x => x.Trim()).ToArray();
                    for (int i = 0; i < selectorParts.Length; i++)
                    {
                        //Abs + selectorPart
                        selector = selector + absoluteSelector + " " + selectorParts[i];

                        //Add a comma if its not the last part.
                        if (i != selectorParts.Length - 1)
                        {
                            selector = selector + ", ";
                        }
                    }

                    absoluteSelector = selector;
                }
            }

            return absoluteSelector.Trim();
        }

        public static IEnumerable<IWebElement> JQueryFindElements(WebContext context, string jquerySelector)
        {
            //Switch back to default frame.
            context.Driver.SwitchTo().DefaultContent();

            if (jquerySelector.ToUpper().Contains("[IFRAME="))
            {
                var frames = Helpers.ExtractiFrameData(jquerySelector);
                foreach (var frame in frames)
                {
                    if (!string.IsNullOrEmpty(frame.iFrameName))
                    {
                        //Switch to the new frame
                        context.Driver.SwitchTo().Frame(frame.iFrameName);
                        Debug.WriteLine("JQueryFind: SwitchToFrame: {0}", (object)frame.iFrameName);
                    }

                    //Because we are jumping frames we don't care about the jQuery in between them.. Only the last one.
                    jquerySelector = frame.jQuery;
                }
            }

            Debug.WriteLine("JQueryFind: $('{0}')", (object)jquerySelector);

            var elements = (IEnumerable<object>)context.ExecuteScript(@"return $(arguments[0]).get();", jquerySelector);
            return elements.Cast<IWebElement>();
        }
    }
}