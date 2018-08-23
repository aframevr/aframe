var eventFunctions = new WeakSet();

/*
 * Allows you to automatically bind functions in a component to events. Example:
 *
 * AFRAME.registerComponent('test', {
 *   clicked: bindEvent(function(eventDetails) {
 *     console.log("I was clicked!");
 *   });
 * });
 *
 * This is equivalient to:
 * AFRAME.registerComponent('test', {
 *   init() {
 *     this.clicked = this.clicked.bind(this);
 *     this.el.addEventListener('clicked', this.clicked);
 *   },
 *   remove() {
 *     this.el.removeEventListener('clicked', this.clicked);
 *   },
 *   clicked(eventDetails) {
 *     console.log("I was clicked");
 *   }
 * });
 *
 * This function should only be used when calling registerComponent. Using it outside this
 * context won't do anything. The name of the property assigned to is the event that will
 * be listened for. Event listeners will be automatically created and removed when the
 * the component is initialised or removed.
 *
 */
function bindEvent (f) {
  if (typeof f === 'function') {
    eventFunctions.add(f);
  }
  return f;
}

/*
 * Will be called whenever a new component instance is created. If it has any functions
 * bound with 'bindEvent' then this will add the event listener.
 */
function initialiseEventFunctions (component) {
  var prot = Object.getPrototypeOf(component);
  var props = Object.getOwnPropertyNames(prot);
  var hasEventFunction = false;
  var propName, prop;
  for (var i = 0; i < props.length; i++) {
    propName = props[i];
    prop = prot[propName];
    if (eventFunctions.has(prop)) {
      hasEventFunction = true;
      component.el.addEventListener(propName, prop);
    }
  }
  if (hasEventFunction) {
    component.remove = wrapRemove(component);
  }
}

/*
 * Wraps the remove function in a component instance to remove all event
 * listeners created by this module.
 */
function wrapRemove (component) {
  var origRemove = component.remove;
  return function () {
    origRemove.call(component, arguments);
    unbindEventFunctions(component);
  };
}

function unbindEventFunctions (component) {
  var prot = Object.getPrototypeOf(component);
  var props = Object.getOwnPropertyNames(prot);
  var propName, prop;
  for (var i = 0; i < props.length; i++) {
    propName = props[i];
    prop = prot[propName];
    if (eventFunctions.has(prop)) {
      component.el.removeEventListener(propName, prop);
    }
  }
}

exports = module.exports = { bindEvent, initialiseEventFunctions };
