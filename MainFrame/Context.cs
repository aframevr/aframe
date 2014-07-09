using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame
{
    public abstract class Context : IContext
    {
        public IContext ParentContext { get; private set; }

        public SearchParameterCollection SearchParameters { get; private set; }

        public Context(IContext parentContext, SearchParameterCollection searchParameters)
        {
            this.ParentContext = parentContext;

            if (searchParameters == null)
                searchParameters = new SearchParameterCollection();

            this.SearchParameters = searchParameters;
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