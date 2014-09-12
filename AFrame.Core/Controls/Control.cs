using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading;

namespace AFrame.Core
{
    public abstract class Control
    {
        public IContext Context { get; private set; }

        public Technology Technology { get; private set; }

        public SearchPropertyStack SearchProperties { get { return this.Context.SearchPropertyStack; } }

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
        { }

        /// <summary>
        /// Quick check to see if the control exists or not.
        /// </summary>
        public bool Exists
        {
            get
            {
                var beforeSearchTimeout = Playback.SearchTimeout;
                try
                {
                    Playback.SearchTimeout = 0;
                    this.Find();
                    return true;
                }
                catch (ControlNotFoundTimeoutException)
                {
                    return false;
                }
                finally
                {
                    Playback.SearchTimeout = beforeSearchTimeout;
                }
            }
        }

        public void Find()
        {
            var millisecondsTimeout = Playback.SearchTimeout;
            var stoppy = Stopwatch.StartNew();
            do
            {
                try
                {
                    this._rawControl = this.RawFind();
                    if (this._rawControl == null)
                        throw new ControlNotFoundException(this);
                    else
                    {
                        //We found it.
                        break;
                    }
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

            //After all that, if the control is still not found, throw exception.
            if (this._rawControl == null)
                throw new ControlNotFoundTimeoutException(this, TimeSpan.FromMilliseconds(Playback.SearchTimeout));

            if (Playback.HighlightOnFind)
                this.Highlight();
        }

        protected virtual object RawFind()
        {
            throw new NotImplementedException();
        }

        public virtual T CreateControl<T>(IEnumerable<SearchProperty> searchParameters)
        {
            throw new NotImplementedException();
        }

        public virtual IEnumerable<T> CreateControls<T>(IEnumerable<SearchProperty> searchParameters)
        {
            throw new NotImplementedException();
        }

        protected virtual T CreateControlItem<T>(IEnumerable<SearchProperty> searchParameters)
        {
            throw new NotImplementedException();
        }


        #region Wait Until's
        public virtual bool WaitUntil<T>(Predicate<T> conditionEvaluator, int millisecondsTimeout) where T : Control
        {
            var beforeSearchTimeout = Playback.SearchTimeout;
            try
            {
                //We dont want to wait in the find..
                Playback.SearchTimeout = 0;

                var stoppy = Stopwatch.StartNew();
                do
                {
                    try
                    {
                        if (conditionEvaluator((T)this))
                            return true;
                    }
                    catch (ControlNotFoundTimeoutException)
                    {
                        //Swallow this exception.
                    }
                    finally
                    {
                        Thread.Sleep(Math.Min(Math.Max((int)((int)(millisecondsTimeout - (int)stoppy.ElapsedMilliseconds)), 0), 100));
                    }
                }
                while (stoppy.ElapsedMilliseconds < millisecondsTimeout);

            }
            finally
            {
                Playback.SearchTimeout = beforeSearchTimeout;
            }

            return false;
        }

        public virtual bool WaitUntil<T>(Predicate<T> conditionEvaluator)  where T : Control
        {
            return WaitUntil<T>(conditionEvaluator, Playback.SearchTimeout);
        }

        public virtual bool WaitUntilExists(int waitTimeout)
        {
            return WaitUntil<Control>(x => x.Exists, waitTimeout);
        }

        public virtual bool WaitUntilExists()
        {
            return WaitUntilExists(Playback.SearchTimeout);
        }  

        public virtual bool WaitUntilNotExists(int waitTimeout)
        {
            return WaitUntil<Control>(x => !x.Exists, waitTimeout);
        }

        public virtual bool WaitUntilNotExists()
        {
            return WaitUntilNotExists(Playback.SearchTimeout);
        }
        #endregion

        public class PropertyNames
        {

        }
    }
}
