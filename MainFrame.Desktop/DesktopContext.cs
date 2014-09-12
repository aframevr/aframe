using MainFrame.Core;
using MainFrame.Desktop.Controls;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Desktop
{
    public class DesktopContext : Context
    {
        public ApplicationUnderTest ApplicationUnderTest { get; private set; }

        public DesktopContext()
            : this(null, null)
        { }

        internal DesktopContext(IContext parentContext, SearchPropertyStack searchParamters)
            : base(parentContext, searchParamters)
        {}

        public override void Dispose()
        {
            if(this.ApplicationUnderTest != null)
                this.ApplicationUnderTest.Dispose();
        }

        public T Launch<T>(string appPath) where T : DesktopControl
        {
            MainFrame.Core.Playback.HighlightOnFind = false;

            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.SmartMatchOptions = Microsoft.VisualStudio.TestTools.UITest.Extension.SmartMatchOptions.None;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.ShouldSearchFailFast = true;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.MatchExactHierarchy = true;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.DelayBetweenActions = 0;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.SearchTimeout = MainFrame.Core.Playback.SearchTimeout;

            Mouse.MouseDragSpeed = 0;
            Mouse.MouseMoveSpeed = 0;

            //Process.Start(new ProcessStartInfo(appPath));

            this.ApplicationUnderTest = ApplicationUnderTest.Launch(appPath);

            return this.As<T>();
        }
    }
}
