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

            var regex = @"\[iframe=[^\[\]]*(?:\[[^\[\]]*\])*.*?]";

            var iFrames = Regex.Matches(jquery, regex, RegexOptions.IgnoreCase);
            var jQueries = Regex.Split(jquery, regex, RegexOptions.IgnoreCase);
            for (int i = 0; i < jQueries.Count(); i++)
            {
                var iFrame = (iFrames.Count == i) ? "" : iFrames[i].Value;
                var jQuerySelector = iFrame;

                var stuffToStrip = new string[] { @"[iframe='" };

                //Start - Strip the [iframe= from the start.
                jQuerySelector = Regex.Replace(jQuerySelector, Regex.Escape("[iframe="), "", RegexOptions.IgnoreCase);

                //End - Remove the ] on the end.
                if (jQuerySelector.Length > 1)
                    jQuerySelector = jQuerySelector.Remove(jQuerySelector.Length - 1, 1);

                //Remove the start and end quotes.
                if (jQuerySelector.StartsWith("'")) //Single Quotes
                    jQuerySelector = jQuerySelector.Substring(1, jQuerySelector.Length - 1);

                if (jQuerySelector.StartsWith("\"")) //Double Quotes
                    jQuerySelector = jQuerySelector.Substring(1, jQuerySelector.Length - 1);

                if(jQuerySelector.EndsWith("'")) //Single Quotes
                    jQuerySelector = jQuerySelector.Remove(jQuerySelector.Length - 1, 1);

                if (jQuerySelector.EndsWith("\"")) //Double Quotes
                    jQuerySelector = jQuerySelector.Remove(jQuerySelector.Length - 1, 1);

                var jQuery = jQueries[i];

                //Don't add a iFrame when both are empty.
                if (string.IsNullOrEmpty(jQuerySelector) && string.IsNullOrEmpty(jQuery))
                {
                    continue;
                }
                else
                {
                    list.Add(new iFrameData { jQuerySelector = jQuerySelector, jQuery = jQuery });
                }
            }

            return list;
        }

        public class iFrameData
        {
            public string jQuerySelector { get; set; }

            public string jQuery { get; set; }
        }

        public static string ToAbsoluteSelector(Control webControl)
        {
            //Create the control stack, reverse it, and walk backwards up it.
            var controlStack = new List<Control>();
            var control = webControl;
            while (control != null)
            {
                controlStack.Add(control);
                control = control.Parent;
            }
            controlStack.Reverse();

            //From the parent, all the way down the stack, generate the jquery selector.
            var absoluteSelector = "";
            foreach (var ctrl in controlStack)
	        {
                var jquerySelector = ctrl.SearchProperties.SingleOrDefault(x => x.Name.Equals(WebControl.SearchNames.JQuerySelector, StringComparison.InvariantCultureIgnoreCase));
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

            return JQueryFindElementsStartingFromCurrentFrame(context, jquerySelector);
        }

        private static IEnumerable<IWebElement> JQueryFindElementsStartingFromCurrentFrame(WebContext context, string jquerySelector)
        {
            if (jquerySelector.ToUpper().Contains("[IFRAME="))
            {
                var frames = Helpers.ExtractiFrameData(jquerySelector);
                foreach (var frame in frames)
                {
                    if (!string.IsNullOrEmpty(frame.jQuerySelector))
                    {
                        //Find the frame element.
                        var iFrameElement = Helpers.JQueryFindElementsStartingFromCurrentFrame(context, frame.jQuerySelector).FirstOrDefault();

                        if (iFrameElement == null)
                            throw new NotFoundException("iframe could not be found given the following jquery selector: " + frame.jQuerySelector);

                        //Switch to the new frame
                        context.Driver.SwitchTo().Frame(iFrameElement);
                        Debug.WriteLine("JQueryFind: SwitchToFrame: {0}", (object)frame.jQuerySelector);
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