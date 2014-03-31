using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Mainframe
{
    public abstract class Control
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
                    this.Find();
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

        public virtual void Highlight()
        {

        }

        public void Find()
        {
            this._rawControl = this.RawFind();
            if (this._rawControl == null)
                throw new ControlNotFoundException();

            this.Highlight();
        }

        protected bool WaitForCondition<T>(T conditionContext, Predicate<T> conditionEvaluator, int millisecondsTimeout)
        {
            var stoppy = Stopwatch.StartNew();
            do
            {
                try
                {
                    if (conditionEvaluator(conditionContext))
                        return true;
                }
                catch (ControlNotFoundException)
                {
                    //Swallow this exception.
                }
                finally
                {
                    Thread.Sleep(Math.Min(Math.Max((int)((int)(millisecondsTimeout - (int)stoppy.ElapsedMilliseconds)), 0), 100));
                }
            }
            while (stoppy.ElapsedMilliseconds < millisecondsTimeout);
            return false;
        }

        public virtual bool WaitForCondition(Predicate<Control> conditionEvaluator, int millisecondsTimeout)
        {
            return WaitForCondition<Control>(this, conditionEvaluator, millisecondsTimeout);
        }

        protected virtual object RawFind()
        {
            throw new NotImplementedException();
        }

        public virtual T CreateControl<T>(IEnumerable<SearchParameter> searchParameters) where T : Control
        {
            throw new NotImplementedException();
        }

        public virtual IEnumerable<T> CreateControls<T>(IEnumerable<SearchParameter> searchParameters) where T : Control
        {
            throw new NotImplementedException();
        }

        protected virtual T CreateControlItem<T>(IEnumerable<SearchParameter> searchParameters)
        {
            throw new NotImplementedException();
        }

        public class SearchProperties
        {

        }
    }
}
