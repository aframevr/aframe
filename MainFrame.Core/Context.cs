using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Core
{
    public abstract class Context : IContext
    {
        public IContext ParentContext { get; private set; }

        public SearchPropertyStack SearchPropertyStack { get; private set; }

        public Context(IContext parentContext, SearchPropertyStack searchPropertyStack)
        {
            this.ParentContext = parentContext;
            this.SearchPropertyStack = searchPropertyStack ?? new SearchPropertyStack();
        }

        public abstract void Dispose();

        public T As<T>() where T : Control
        {
            return (T)Activator.CreateInstance(typeof(T), this);
        }

        public Control As()
        {
            return As<Control>();
        }
    }
}