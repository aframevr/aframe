using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Core
{
    public interface IContext : IDisposable
    {
        T As<T>() where T : Control;
        Control As();
    }
}
