/* global AFRAME */
var registerComponent = require('../../core/component').registerComponent;
var pkg = require('../../../package');

var INSPECTOR_URL = pkg.homepage + 'releases/' + pkg.version + '/aframe-inspector.min.js';

module.exports.Component = registerComponent('inspector', {
  schema: {
    url: {default: INSPECTOR_URL}
  },

  init: function () {
    this.onKeydown = this.onKeydown.bind(this);
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
