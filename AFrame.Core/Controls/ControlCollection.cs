using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Core
{
    public abstract class ControlCollection<T> : Control, IEnumerable<T> where T : Control
    {
        public T ProxyControl { get; private set; }

        public ControlCollection(IContext context, Technology technology, Control parent, SearchPropertyCollection searchProperties)
            : base(context, technology, parent, searchProperties)
        {
            this.ProxyControl = (T)Activator.CreateInstance(typeof(T), context, parent);
            this.ProxyControl.SearchProperties.AddRange(searchProperties);
        }

        public IEnumerator<T> GetEnumerator()
        {
            return this.FindControls().GetEnumerator();
        }

        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
        {
            return this.FindControls().GetEnumerator();
        }

        private IEnumerable<T> FindControls()
        {
            return (IEnumerable<T>)this.RawFind();
        }
    }
}