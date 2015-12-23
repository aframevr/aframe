using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Core
{
    public abstract class ControlCollection<T> : Control, IEnumerable<T> where T : Control
    {
        public ControlCollection(IContext context, Technology technology, Control parent, IEnumerable<SearchProperty> searchProperties)
            : base(context, technology)
        {
            this.Parent = parent;
            this.SearchProperties.AddRange(searchProperties);
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