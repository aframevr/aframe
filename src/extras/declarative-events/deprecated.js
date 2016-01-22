/**
 * Deprecated: to be removed in v0.3.0.
 */
var AEvent = require('./index').AEvent;
var registerElement = require('../../core/a-register-element').registerElement;

register('a-click', 'click');
register('a-hover', 'mouseenter');
register('a-load', 'loaded');
register('a-mouseenter', 'mouseenter');
register('a-mousedown', 'mousedown');
register('a-mouseleave', 'mouseleave');
register('a-mouseup', 'mouseup');

function register (newTagName, eventName) {
  return registerElement(newTagName, {
    prototype: Object.create(AEvent.prototype, {
      deprecated: {
        value: true
      },
      type: {
        value: eventName,
        writable: window.debug
      }
    })
  });
}
