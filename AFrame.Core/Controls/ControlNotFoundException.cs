using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AFrame.Core
{
    public class ControlNotFoundException : Exception
    {
        public Control Control { get; private set; }

        public ControlNotFoundException(Control control)
        {
            this.Control = control;
        }
    }
}