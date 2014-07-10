using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MainFrame.Core
{
    public interface IContext : IDisposable
    {
        SearchParameterCollection SearchParameters { get; }

        IContext ParentContext { get; }
    }
}
