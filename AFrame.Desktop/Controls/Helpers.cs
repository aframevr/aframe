using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop.Controls
{
    public class Helpers
    {
        internal static UITestControl GenerateUITestControl(DesktopControl desktopControl)
        {
            var uiTestControl = UITestControl.Desktop;
            foreach (var searchProperties in desktopControl.SearchProperties)
            {
                if (searchProperties.Count() == 0)
                    throw new Exception("Search Properties must not be empty.");

                uiTestControl = new UITestControl(uiTestControl);
                uiTestControl.TechnologyName = desktopControl.TechnologyName;
                foreach (var searchProperty in searchProperties)
                {
                    uiTestControl.SearchProperties.Add(searchProperty.Name, searchProperty.Value);
                }
            }

            return uiTestControl;
        }
    }
}
