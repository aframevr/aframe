/* global customElements, HTMLElement */
import { debug } from '../utils/index.js';

var warn = debug('core:cubemap:warn');

/**
 * Cubemap element that handles validation and exposes list of six image sources (URL or <img>).
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
   * When <img>s are used they will be prefetched.
   *
   * @returns {Array<string|Element>|undefined} six URLs or <img> elements if valid, else undefined.
   */
  validate () {
    var elements = this.querySelectorAll('[src]');
    var i;
    var srcs = [];
    if (elements.length === 6) {
      for (i = 0; i < elements.length; i++) {
        if (elements[i].tagName === 'IMG') {
          srcs.push(elements[i]);
        } else {
          srcs.push(elements[i].getAttribute('src'));
        }
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
