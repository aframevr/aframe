/* global AFRAME */
var AFRAME_INJECTED = require('../../constants').AFRAME_INJECTED;
var bind = require('../../utils/bind');
var pkg = require('../../../package');
var registerComponent = require('../../core/component').registerComponent;

var INSPECTOR_URL = pkg.homepage + 'releases/' + pkg.version + '/aframe-inspector.min.js';

module.exports.Component = registerComponent('inspector', {
  schema: {
    url: {default: INSPECTOR_URL}
  },

  init: function () {
    this.onKeydown = bind(this.onKeydown, this);
    this.onMessage = bind(this.onMessage, this);
    window.addEventListener('keydown', this.onKeydown);
    window.addEventListener('message', this.onMessage);
  },

  remove: function () {
    this.removeEventListeners();
  },

  /**
   * <ctrl> + <alt> + i keyboard shortcut.
   */
  onKeydown: function (evt) {
    var shortcutPressed = evt.keyCode === 73 && evt.ctrlKey && evt.altKey;
    if (!this.data || !shortcutPressed) { return; }
    this.injectInspector();
  },

  /**
   * postMessage. aframe.io uses this to create a button on examples to open Inspector.
   */
  onMessage: function (evt) {
    if (evt.data === 'INJECT_AFRAME_INSPECTOR') { this.injectInspector(); }
  },

  injectInspector: function () {
    var self = this;
    var script;

    if (AFRAME.INSPECTOR || AFRAME.inspectorInjected) { return; }

    // Inject.
    script = document.createElement('script');
    script.src = this.data.url;
    script.setAttribute('data-name', 'aframe-inspector');
    script.setAttribute(AFRAME_INJECTED, '');
    script.onload = function () {
      AFRAME.INSPECTOR.open();
      self.removeEventListeners();
    };
    document.head.appendChild(script);
    AFRAME.inspectorInjected = true;
  },

  removeEventListeners: function () {
    window.removeEventListener('keydown', this.onKeydown);
    window.removeEventListener('message', this.onMessage);
  }
});
