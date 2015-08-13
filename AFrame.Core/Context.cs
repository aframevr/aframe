using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Core
{
    public abstract class Context : IContext
    {
        public abstract void Dispose();

        public T As<T>() where T : Control
        {
            return (T)Control.CreateInstance<T>(this, null);
        }

        public Control As()
        {
            return As<Control>();
        }
    }
}