using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AFrame.Core
{
    public class ControlNotFoundTimeoutException : ControlNotFoundException
    {
        public TimeSpan Timeout { get; private set; }

        public ControlNotFoundTimeoutException(Control control, TimeSpan timeout)
            : base(control)
        {
            this.Timeout = timeout;
        }
    }
}