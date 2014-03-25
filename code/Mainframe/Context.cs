using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mainframe
{
    public abstract class Context : IContext
    {
        public IContext ParentContext { get; private set; }

        public SearchParameterCollection SearchParameters { get; private set; }

        public Context(IContext parentContext, SearchParameterCollection searchParameters)
        {
            this.ParentContext = parentContext;
            this.SearchParameters = searchParameters;
        }

        public abstract void Dispose();
    }
}