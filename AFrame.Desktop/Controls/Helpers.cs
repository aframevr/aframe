using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls
{
    internal class Helpers
    {
        internal static UITestControl GenerateUITestControl(DesktopControl desktopControl)
        {
            //Create the control stack, reverse it, and walk backwards up it.
            var controlStack = new List<DesktopControl>();
            var control = desktopControl;
            while (control != null)
            {
                controlStack.Add(control);
                control = control.Parent;
            }
            controlStack.Reverse();

            var uiTestControl = UITestControl.Desktop;
            foreach (var ctrl in controlStack)
            {
                if (ctrl.SearchProperties.Count() == 0)
                    throw new Exception("Search Properties must not be empty.");

                uiTestControl = new UITestControl(uiTestControl);
                uiTestControl.TechnologyName = ctrl._technologyName;
                foreach (var searchProperty in ctrl.SearchProperties)
                {
                    if (searchProperty.SearchOperator == Core.SearchOperator.EqualTo)
                    {
                        uiTestControl.SearchProperties.Add(searchProperty.Name, searchProperty.Value, PropertyExpressionOperator.EqualTo);
                    }
                    else
                    {
                        uiTestControl.SearchProperties.Add(searchProperty.Name, searchProperty.Value, PropertyExpressionOperator.Contains);
                    }
                }
            }

            return uiTestControl;






            //foreach (var searchProperties in desktopControl.SearchProperties)
            //{
            //    if (searchProperties.Count() == 0)
            //        throw new Exception("Search Properties must not be empty.");

            //    uiTestControl = new UITestControl(uiTestControl);
            //    uiTestControl.TechnologyName = desktopControl._technologyName;
            //    foreach (var searchProperty in searchProperties)
            //    {
            //        if(searchProperty.SearchOperator == Core.SearchOperator.EqualTo)
            //        {
            //            uiTestControl.SearchProperties.Add(searchProperty.Name, searchProperty.Value, PropertyExpressionOperator.EqualTo);
            //        }
            //        else
            //        {
            //            uiTestControl.SearchProperties.Add(searchProperty.Name, searchProperty.Value, PropertyExpressionOperator.Contains);
            //        }
            //    }
            //}

            //return uiTestControl;
        }
    }
}
