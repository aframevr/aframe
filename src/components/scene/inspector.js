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
    window.addEventListener('keydown', this.onKeydown);
  },

  onKeydown: function (evt) {
    // Alt + Ctrl + i
    var shortcutPressed = evt.keyCode === 73 && evt.ctrlKey && evt.altKey;
    if (!this.data || !shortcutPressed) { return; }
    this.injectInspector();
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
      window.removeEventListener('keydown', self.onKeydown);
    };
    document.head.appendChild(script);
    AFRAME.inspectorInjected = true;
  },

  remove: function () {
    window.removeEventListener('keydown', this.onKeydown);
  }
});
