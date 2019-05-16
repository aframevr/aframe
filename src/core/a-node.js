/* global customElements, CustomEvent, HTMLElement */
var utils = require('../utils/');

var warn = utils.debug('core:a-node:warn');
var error = utils.debug('core:a-node:error');

var knownTags = {
  'a-assets': true,
  'a-assets-items': true,
  'a-cubemap': true,
  'a-mixin': true,
  'a-node': true,
  'a-entity': true
};

/**
 * Base class for A-Frame that manages loading of objects.
 *
 * Nodes can be modified using mixins.
 * Nodes emit a `loaded` event when they and their children have initialized.
 */
class ANode extends HTMLElement {
  static get observedAttributes () {
    return ['mixin'];
  }

  constructor () {
    super();
    this.computedMixinStr = '';
    this.hasLoaded = false;
    this.isNode = true;
    this.mixinEls = [];
  }

  connectedCallback () {
    var mixins;
    this.sceneEl = this.closestScene();

    if (!this.sceneEl) {
      warn('You are attempting to attach <' + this.tagName + '> outside of an A-Frame ' +
           'scene. Append this element to `<a-scene>` instead.');
    }

    this.hasLoaded = false;
    this.emit('nodeready', undefined, false);

    if (!this.isMixin) {
      mixins = this.getAttribute('mixin');
      if (mixins) { this.updateMixins(mixins); }
    }
  }

  /**
   * Handle mixin.
   */
  attributeChangedCallback (attr, oldVal, newVal) {
    // Ignore if `<a-node>` code is just updating computed mixin in the DOM.
    if (newVal === this.computedMixinStr) { return; }

    if (attr === 'mixin' && !this.isMixin) {
      this.updateMixins(newVal, oldVal);
    }
  }

 /**
  * Returns the first scene by traversing up the tree starting from and
  * including receiver element.
  */
  closestScene () {
    var element = this;
    while (element) {
      if (element.isScene) { break; }
      element = element.parentElement;
    }
    return element;
  }

  /**
   * Returns first element matching a selector by traversing up the tree starting
   * from and including receiver element.
   *
   * @param {string} selector - Selector of element to find.
   */
  closest (selector) {
    var matches = this.matches || this.mozMatchesSelector ||
      this.msMatchesSelector || this.oMatchesSelector || this.webkitMatchesSelector;
    var element = this;
    while (element) {
      if (matches.call(element, selector)) { break; }
      element = element.parentElement;
    }
    return element;
  }

  disconnectedCallback () {
    this.hasLoaded = false;
  }

  /**
   * Wait for children to load, if any.
   * Then emit `loaded` event and set `hasLoaded`.
   */
  load (cb, childFilter) {
    var children;
    var childrenLoaded;
    var self = this;

    if (this.hasLoaded) { return; }

    // Default to waiting for all nodes.
    childFilter = childFilter || isNode;
    // Wait for children to load (if any), then load.
    children = this.getChildren();
    childrenLoaded = children.filter(childFilter).map(function (child) {
      return new Promise(function waitForLoaded (resolve) {
        if (child.hasLoaded) { return resolve(); }
        child.addEventListener('loaded', resolve);
      });
    });

    Promise.all(childrenLoaded).then(function emitLoaded () {
      self.hasLoaded = true;
      if (cb) { cb(); }
      self.emit('loaded', undefined, false);
    }).catch(function (err) {
      error('Failure loading node: ', err);
    });
  }

  getChildren () {
    return Array.prototype.slice.call(this.children, 0);
  }

  /**
   * Unregister old mixins and listeners.
   * Register new mixins and listeners.
   * Registering means to update `this.mixinEls` with listeners.
   */
  updateMixins (newMixins, oldMixins) {
    var newMixinIdArray = ANode.newMixinIdArray;
    var oldMixinIdArray = ANode.oldMixinIdArray;
    var mixinIds = ANode.mixinIds;

    var i;
    var newMixinIds;
    var oldMixinIds;

    newMixinIdArray.length = 0;
    oldMixinIdArray.length = 0;
    newMixinIds = newMixins ? utils.split(newMixins.trim(), /\s+/) : newMixinIdArray;
    oldMixinIds = oldMixins ? utils.split(oldMixins.trim(), /\s+/) : oldMixinIdArray;

    mixinIds.newMixinIds = newMixinIds;
    mixinIds.oldMixinIds = oldMixinIds;

    // Unregister old mixins.
    for (i = 0; i < oldMixinIds.length; i++) {
      if (newMixinIds.indexOf(oldMixinIds[i]) === -1) {
        this.unregisterMixin(oldMixinIds[i]);
      }
    }

    // Register new mixins.
    this.computedMixinStr = '';
    this.mixinEls.length = 0;
    for (i = 0; i < newMixinIds.length; i++) {
      this.registerMixin(document.getElementById(newMixinIds[i]));
    }

    // Update DOM. Keep track of `computedMixinStr` to not recurse back here after
    // update.
    if (this.computedMixinStr) {
      this.computedMixinStr = this.computedMixinStr.trim();
      window.HTMLElement.prototype.setAttribute.call(this, 'mixin',
                                                     this.computedMixinStr);
    }

    return mixinIds;
  }

  /**
   * From mixin ID, add mixin element to `mixinEls`.
   *
   * @param {Element} mixinEl
   */
  registerMixin (mixinEl) {
    var compositedMixinIds;
    var i;
    var mixin;

    if (!mixinEl) { return; }

    // Register composited mixins (if mixin has mixins).
    mixin = mixinEl.getAttribute('mixin');
    if (mixin) {
      compositedMixinIds = utils.split(mixin.trim(), /\s+/);
      for (i = 0; i < compositedMixinIds.length; i++) {
        this.registerMixin(document.getElementById(compositedMixinIds[i]));
      }
    }

    // Register mixin.
    this.computedMixinStr = this.computedMixinStr + ' ' + mixinEl.id;
    this.mixinEls.push(mixinEl);
  }

  setAttribute (attr, newValue) {
    if (attr === 'mixin') { this.updateMixins(newValue); }
    window.HTMLElement.prototype.setAttribute.call(this, attr, newValue);
  }

  unregisterMixin (mixinId) {
    var i;
    var mixinEls = this.mixinEls;
    var mixinEl;
    for (i = 0; i < mixinEls.length; ++i) {
      mixinEl = mixinEls[i];
      if (mixinId === mixinEl.id) {
        mixinEls.splice(i, 1);
        break;
      }
    }
  }

  /**
   * Emit a DOM event.
   *
   * @param {string} name - Name of event.
   * @param {object} [detail={}] - Custom data to pass as `detail` to the event.
   * @param {boolean} [bubbles=true] - Whether the event should bubble.
   * @param {object} [extraData] - Extra data to pass to the event, if any.
   */
  emit (name, detail, bubbles, extraData) {
    var data = ANode.evtData;

    if (bubbles === undefined) { bubbles = true; }
    data.bubbles = !!bubbles;
    data.detail = detail;

    // If extra data is present, we need to create a new object.
    if (extraData) { data = utils.extend({}, extraData, data); }

    this.dispatchEvent(new CustomEvent(name, data));
  }
}

ANode.evtData = {};
ANode.newMixinIdArray = [];
ANode.oldMixinIdArray = [];
ANode.mixinIds = {};

module.exports.ANode = ANode;
module.exports.knownTags = knownTags;

customElements.define('a-node', ANode);

/**
 * Return whether the element type is one of our known registered ones.
 *
 * @param {string} node - The name of the tag to register.
 * @returns {boolean} Whether the tag name matches that of our registered custom elements.
 */
function isNode (node) {
  return node.tagName.toLowerCase() in knownTags || node.isNode;
}
