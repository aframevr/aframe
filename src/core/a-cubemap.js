/* global customElements, HTMLElement */
var debug = require('../utils/debug');

var warn = debug('core:cubemap:warn');

/**
 * Cubemap element that handles validation and exposes list of URLs.
 * Does not listen to updates.
 */
class ACubeMap extends HTMLElement {
  /**
   * Calculates this.srcs.
   */

  constructor (self) {
    self = super(self);
    return self;
  }

  onReadyStateChange () {
    if (document.readyState === 'complete') {
      this.doConnectedCallback();
    }
  }

  connectedCallback () {
    // Defer if DOM is not ready.
    if (document.readyState !== 'complete') {
      document.addEventListener('readystatechange', this.onReadyStateChange.bind(this));
      return;
    }
    ACubeMap.prototype.doConnectedCallback.call(this);
  }

  doConnectedCallback () {
    this.srcs = this.validate();
  }

  /**
   * Checks for exactly six elements with [src].
   * Does not check explicitly for <img>s in case user does not want
   * prefetching.
   *
   * @returns {Array|null} - six URLs if valid, else null.
   */
  validate () {
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
  }
}

customElements.define('a-cubemap', ACubeMap);
