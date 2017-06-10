var debug = require('../utils/debug');
var registerElement = require('./a-register-element').registerElement;

var warn = debug('core:cubemap:warn');

/**
 * Cubemap element that handles validation and exposes list of URLs.
 * Does not listen to updates.
 */
module.exports = registerElement('a-cubemap', {
  prototype: Object.create(window.HTMLElement.prototype, {
    /**
     * Calculates this.srcs.
     */
    attachedCallback: {
      value: function () {
        this.srcs = this.validate();
      },
      writable: window.debug
    },

    /**
     * Checks for exactly six elements with [src].
     * Does not check explicitly for <img>s in case user does not want
     * prefetching.
     *
     * @returns {Array|null} - six URLs if valid, else null.
     */
    validate: {
      value: function () {
        var elements = this.querySelectorAll('[src]');
        var i;
        var srcs = [];
        if (elements.length === 6) {
          for (i = 0; i < elements.length; i++) {
            srcs.push(elements[i].getAttribute('src'));
          }
          return srcs;
        }
        // Else if there are not six elements, throw a warning.
        warn(
          '<a-cubemap> did not contain exactly six elements each with a ' +
          '`src` attribute.');
      },
      writable: window.debug
    }
  })
});
