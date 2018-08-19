/*
 * Provides a decorator functor for annotating functions in Component definitions so that they are automatically
 * bound and unbound from events without needing to call el.addEventListener or el.removeEventListener yourself.
 *
 * Decorations should be made in the Components definition object. Here is the simplest example:
 *
 * var {bindEvent} = require('event-binder');
 *
 * AFRAME.registerComponent("foo", {
 *   componentchanged: bindEvent( function(evt) {
 *     console.log(evt.detail);
 *   })
 * })
 *
 * By default the function will be bound to events corresponding to its property name, in this case: 'componentchanged'.
 * It will listen for events on its parent element, and will begin listening or end listening when init or remove is
 * called. However this can also be configured by passing a configuration object:
 *
 * AFRAME.registerComponent("foo", {
 *   whenSceneLoads: bindEvent( {
 *     event: "loaded",    // Event to listen for. Defaults to functions propery name.
 *     target: "a-scene",  // Selector string for which element to listen on, defaults to this.el
 *     listenIn: "init",   // Which function addEventListener is called in, defaults to 'init'
 *     removeIn: "remove", // Which function removeEventListener is called in, defaults to 'remove'
 *   }, function(evt) {
 *     console.log(evt.detail);
 *   })
 * })
 *
 * Functions will only be bound to events when a new component is created. Decorating a function with bindEvent()
 * in a components init, or tick functions for example will have no effect.
 *
 * Don't bind to arrow functions because they don't have their own this.
 *
 */

/*
 * Decorates a function with configurations for automatically binding to an event.
 *
 * @param p1 - If this is a function it will be decorated with default options and p2 is ignored. Otherwise this can be
 *   an object which fine tunes the binding.
 * @param p2 - If p1 is an object then this will be the function to bind to.
 *
 * @returns {function} Decorated function which wraps the input function.
 */
function bindEvent(p1, p2) {
  if (typeof p1 === "function") {
    return decorate(p1, BindToEventDecorator());
  } else if (typeof p1 === "object" && typeof p2 === "function") {
    return decorate(p2, BindToEventDecorator(p1.event, p1.target, p1.listenIn, p1.removeIn));
  } else {
    throw new Error("bindEvent must take: (function), or a ([object], function)")
  }
}

// Implements the automatic binding and unbinding of the chosen function. Wraps its listenIn and removeIn
// functions to add and remove the event listener at the correct times.
function BindToEventDecorator(_event, _target, _listenIn, _removeIn) {
  return function (propertyName, func) {
    var scope = this;
    var event = _event || propertyName;
    var target = !_target ? this.el : document.querySelector(_target);
    if (!target) {
      console.warn("Couldn't subscribe " + this.name + "." + propertyName + " to " + event + " on " + _target
        + " because querySelector returned undefined.");
      return;
    }
    var listenIn = _listenIn || "init";
    var removeIn = _removeIn || "remove";

    var listenFunc = this[listenIn];
    var removeFunc = this[removeIn];
    var boundFunc = func.bind(this);

    this[listenIn] = function () {
      if (listenFunc !== undefined) {
        listenFunc.apply(scope, arguments);
      }
      target.addEventListener(event, boundFunc);
    }

    this[removeIn] = function () {
      if (removeFunc !== undefined) {
        removeFunc.apply(scope, arguments);
      }
      target.removeEventListener(event, boundFunc);
    }

    return func;
  }
}

/*
 * Decorates a function with a functor that is executed in the context of each instantiated Component which owns it.
 *
 * @param func - Function to decorate.
 * @param decoratorFunc - Functor which decorates func. It's definition should appear like this:
 *    function decoratorFunctor(funcPropertyName) {
 *      var func = this[funcPropertyName]; // 'this' is assigned to the instantiated Component.
 *      // Decorator should return a function
 *      return function() {
 *        console.log(this.el.id + " has a decorated function!");
 *        return func.apply(this, arguments);
 *      }
 *    }
 *
 * @returns A pending decorated functor which will be executed when a component that owns it is instantiated.
 */
function decorate(func, decoratorFunc) {
  return decorations.add(func, decoratorFunc);
}

/*
 * Executes all decorated functions on the given component. You shouldn't need to call
 * this yourself.
 */
function executeDecorators(component) {
  var prot = Object.getPrototypeOf(component);
  Object.getOwnPropertyNames(prot).forEach(function (name) {
    var prop = prot[name];
    if (typeof prop === "function" && decorations.isFunctionDecorated(prop)) {
      decorations.getAll(prop).forEach(function (decorator) {
        component[name] = decorator.call(component, name, prop);
      });
    }
  });
}

// Helper for storing and retrieving decorator functors for a given function.
var decorations = (function () {
  var funcMap = new WeakMap();

  function add(func, decorator) {
    var parent = funcMap.has(func) ? func : undefined; // In case decorators are nested.
    var decoratedFunc = function () {
      func.apply(this, arguments);
    };
    funcMap.set(decoratedFunc, { parent: parent, decorator: decorator });
    return decoratedFunc;
  }

  function getAll(func) {
    var iter = funcMap.get(func);
    var decorators = [];
    while (iter !== undefined) {
      decorators.push(iter.decorator);
      iter = iter.parent;
    }
    return decorators;
  }

  function isFunctionDecorated(func) {
    return funcMap.has(func);
  }

  return {
    add: add,
    getAll: getAll,
    isFunctionDecorated: isFunctionDecorated
  };
})();

exports = module.exports = { bindEvent, executeDecorators }
