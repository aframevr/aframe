using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading;
using System.Linq;

namespace AFrame.Core
{
    public abstract class Control
    {
        public IContext Context { get; internal set; }

        public Technology Technology { get; private set; }

        public Control Parent { get; set; }

        public SearchPropertyCollection SearchProperties = new SearchPropertyCollection();

        private volatile bool _isHightlighting;

        #region RawControl
        private object _rawControl;

        public object RawControl
        {
            get
            {
                /* Always Search Feature
                 * --------------------- 
                 * 
                 * If there is a property in the search properties 
                 * set for "Always Search" then it must always call this.Find()
                 * 
                 * If the global property is set for always search, then 
                 * it must call this.Find()
                 * 
                 */

                var alwaysSearch = this.SearchProperties.Any(x => x.Name == Control.SearchNames.AlwaysSearch);
                if (this._rawControl == null || (this._isHightlighting == false && (Playback.AlwaysSearch || alwaysSearch)))
                {
                    this.Find();
                }

                return this._rawControl;
            }
        } 
        #endregion

        public Control(Technology technology)
        {
            this.Technology = technology;
        }

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

            //Always search has issues when trying to highlight upon finding... Basically it gets itself into a loop as
            //Highlight can call find, if its always search it will just keep looping...

            if (Playback.HighlightOnFind)
            {
                try
                {
                    this._isHightlighting = true;
                    this.Highlight();
                }
                finally
                {
                    this._isHightlighting = false;
                }
            }
        }

        protected virtual object RawFind()
        {
            throw new NotImplementedException();
        }

        #region Create Control
        public T CreateControl<T>(params string[] nameValuePairs) where T : Control
        {
            if ((nameValuePairs.Length % 2) != 0)
            {
                throw new ArgumentException("CreateControl needs to have even number of pairs. (Mod 2)", "nameValuePairs");
            }
            var searchProperties = new List<SearchProperty>();
            for (int i = 0; i < nameValuePairs.Length; i = (int)(i + 2))
            {
                searchProperties.Add(new SearchProperty(nameValuePairs[i], nameValuePairs[i + 1]));
            }

            return this.CreateControl<T>(searchProperties);
        }

        public virtual T CreateControl<T>(IEnumerable<SearchProperty> searchProperties) where T : Control
        {
            var control = Control.CreateInstance<T>(this.Context, this);
            control.SearchProperties.AddRange(searchProperties);
            return control;
        }
        #endregion

        public static T CreateInstance<T>(IContext context, Control parent) where T : Control
        {
            //If type has constructor with 1 parameter and is type IContext. Then use that.
            //Else use default constructor.

            var type = typeof(T);

            //First constructor attempt.
            var ctor = type.GetConstructor(new[] { context.GetType() });
            if (ctor != null)
            {
                var ctrl = (T)ctor.Invoke(new object[] { context });
                ctrl.Parent = parent;
                return ctrl;
            }

            //Second constructor attempt.
            ctor = type.GetConstructor(Type.EmptyTypes);
            if (ctor != null)
            {
                var ctrl = (T)ctor.Invoke(new object[] { });
                ctrl.Context = context;
                ctrl.Parent = parent;
                return ctrl;
            }

            throw new Exception("No appropriate constructors found for " + type.Name);
        }

        #region Create Controls
        public virtual IEnumerable<T> CreateControls<T>(IEnumerable<SearchProperty> searchProperties) where T : Control
        {
            throw new NotImplementedException();
        }

        protected virtual T CreateControlItem<T>(IEnumerable<SearchProperty> searchProperties) where T : Control
        {
            throw new NotImplementedException();
        }
        #endregion

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

        public class SearchNames
        {
            public static readonly string AlwaysSearch = "AlwaysSearch";
        }
    }
}
