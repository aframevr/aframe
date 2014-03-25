using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mainframe
{
    public abstract class Control : IControl
    {
        public IContext Context { get; private set; }
        public Technology Technology { get; private set; }

        #region RawControl
        private object _rawControl;
        public object RawControl
        {
            get
            {
                if (this._rawControl == null)
                {
                    this._rawControl = this.RawFind();
                }
                return this._rawControl;
            }
        } 
        #endregion

        public Control(IContext context, Technology technology)
        {
            this.Context = context;
            this.Technology = technology;
        }

        public abstract object RawFind();
    }
}
