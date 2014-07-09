using OpenQA.Selenium;
using OpenQA.Selenium.Support.PageObjects;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace MainFrame.Web.Controls
{
    public static class Extensions
    {
        #region Create Control
        public static T CreateControl<T>(this WebControl control, string jQuerySelector) where T : WebControl
        {
            return control.CreateControl<T>(new List<SearchParameter> 
            { 
                new SearchParameter(WebControl.SearchProperties.JQuerySelector, jQuerySelector) 
            });
        }

        public static WebControl CreateControl(this WebControl control, string jQuerySelector)
        {
            return CreateControl<WebControl>(control, jQuerySelector);
        }
        #endregion

        #region Create Controls
        public static IEnumerable<T> CreateControls<T>(this WebControl control, string jQuerySelector) where T : WebControl
        {
            return control.CreateControls<T>(new List<SearchParameter> 
            { 
                new SearchParameter(WebControl.SearchProperties.JQuerySelector, jQuerySelector) 
            });
        }

        public static IEnumerable<WebControl> CreateControls(this WebControl control, string jQuerySelector)
        {
            return CreateControls<WebControl>(control, jQuerySelector);
        }
        #endregion
    }
}