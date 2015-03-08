using AFrame.Core;
using AFrame.Desktop.Controls;
using Microsoft.VisualStudio.TestTools.UITesting;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Desktop
{
    public class DesktopContext : Context
    {
        public ApplicationUnderTest ApplicationUnderTest { get; private set; }

        public DesktopContext()
            : this(null, null)
        { }

        internal DesktopContext(IContext parentContext, SearchPropertyStack searchParameters)
            : base(parentContext, searchParameters)
        { }

        public override void Dispose()
        {
            if (this.ApplicationUnderTest != null)
                this.ApplicationUnderTest.Dispose();
        }

        public T Launch<T>(ProcessStartInfo startInfo) where T : DesktopControl
        {
            AFrame.Core.Playback.HighlightOnFind = false;

            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.SmartMatchOptions = Microsoft.VisualStudio.TestTools.UITest.Extension.SmartMatchOptions.None;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.ShouldSearchFailFast = true;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.MatchExactHierarchy = true;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.DelayBetweenActions = 0;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.SearchTimeout = AFrame.Core.Playback.SearchTimeout;

            Mouse.MouseDragSpeed = 0;
            Mouse.MouseMoveSpeed = 0;

            this.ApplicationUnderTest = ApplicationUnderTest.Launch(startInfo);

            return this.As<T>();
        }

        public T Launch<T>(string fileName) where T : DesktopControl
        {
            AFrame.Core.Playback.HighlightOnFind = false;

            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.SmartMatchOptions = Microsoft.VisualStudio.TestTools.UITest.Extension.SmartMatchOptions.None;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.ShouldSearchFailFast = true;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.MatchExactHierarchy = true;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.DelayBetweenActions = 0;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.SearchTimeout = AFrame.Core.Playback.SearchTimeout;

            Mouse.MouseDragSpeed = 0;
            Mouse.MouseMoveSpeed = 0;

            this.ApplicationUnderTest = ApplicationUnderTest.Launch(fileName);

            return this.As<T>();
        }

        public T Launch<T>(string fileName, string alternativeFileName) where T : DesktopControl
        {
            AFrame.Core.Playback.HighlightOnFind = false;

            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.SmartMatchOptions = Microsoft.VisualStudio.TestTools.UITest.Extension.SmartMatchOptions.None;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.ShouldSearchFailFast = true;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.MatchExactHierarchy = true;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.DelayBetweenActions = 0;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.SearchTimeout = AFrame.Core.Playback.SearchTimeout;

            Mouse.MouseDragSpeed = 0;
            Mouse.MouseMoveSpeed = 0;

            this.ApplicationUnderTest = ApplicationUnderTest.Launch(fileName, alternativeFileName);

            return this.As<T>();
        }

        public T Launch<T>(string fileName, string alternativeFileName, string arguments) where T : DesktopControl
        {
            AFrame.Core.Playback.HighlightOnFind = false;

            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.SmartMatchOptions = Microsoft.VisualStudio.TestTools.UITest.Extension.SmartMatchOptions.None;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.ShouldSearchFailFast = true;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.MatchExactHierarchy = true;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.DelayBetweenActions = 0;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.SearchTimeout = AFrame.Core.Playback.SearchTimeout;

            Mouse.MouseDragSpeed = 0;
            Mouse.MouseMoveSpeed = 0;

            this.ApplicationUnderTest = ApplicationUnderTest.Launch(fileName, alternativeFileName, arguments);

            return this.As<T>();
        }

        public T Launch<T>(string fileName, string alternativeFileName, string arguments, string userName, System.Security.SecureString password, string domain) where T : DesktopControl
        {
            AFrame.Core.Playback.HighlightOnFind = false;

            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.SmartMatchOptions = Microsoft.VisualStudio.TestTools.UITest.Extension.SmartMatchOptions.None;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.ShouldSearchFailFast = true;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.MatchExactHierarchy = true;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.DelayBetweenActions = 0;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.SearchTimeout = AFrame.Core.Playback.SearchTimeout;

            Mouse.MouseDragSpeed = 0;
            Mouse.MouseMoveSpeed = 0;

            this.ApplicationUnderTest = ApplicationUnderTest.Launch(fileName, alternativeFileName, arguments, userName, password, domain);

            return this.As<T>();
        }

        public T FromProcess<T>(Process processToWrap) where T : DesktopControl
        {
            AFrame.Core.Playback.HighlightOnFind = false;

            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.SmartMatchOptions = Microsoft.VisualStudio.TestTools.UITest.Extension.SmartMatchOptions.None;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.ShouldSearchFailFast = true;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.MatchExactHierarchy = true;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.DelayBetweenActions = 0;
            Microsoft.VisualStudio.TestTools.UITesting.Playback.PlaybackSettings.SearchTimeout = AFrame.Core.Playback.SearchTimeout;

            Mouse.MouseDragSpeed = 0;
            Mouse.MouseMoveSpeed = 0;

            this.ApplicationUnderTest = ApplicationUnderTest.FromProcess(processToWrap);

            return this.As<T>();
        }

    }
}
