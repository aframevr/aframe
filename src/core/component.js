var styleParser = require('style-attr');
var mixin = require('../vr-utils').mixin;

var mixAttributes = function (str, obj) {
  var attrs = str;
  if (!str) { return; }
  // Attributes can come in the form of a string or pre-parsed as an object
  // such as pos/rot/scale.
  if (typeof str === 'string') {
    attrs = styleParser.parse(str);
  }
  mixin(obj, attrs);
};

var Component = function (el) {
  var str = el.getAttribute(this.name);
  this.el = el;
  // To store the component specific data
  this.data = {};
  this.parseAttributes(str);
  this.init();
  this.update();
};

Component.prototype = {
  /**
   * Parses the data coming from the entity attribute
   * and updates the component
   */
  updateAttributes: function (str) {
    this.parseAttributes(str);
    this.update();
  },

  /**
   * Called on component initialization
   */
  init: function () { /* no-op */ },

  /**
   * It is called on the component
   * each time there's a change on the associated
   * data of the entity.
   */
  update: function () { /* no-op */ },

  /**
   * Parses the data coming from the entity attribute
   * If there's a style its values will be mixed in
   */
  parseAttributes: function (str) {
    var mixinEl = this.el.mixinEl;
    var styleStr = mixinEl && mixinEl.getAttribute(this.name);
    var data = {};
    mixAttributes(styleStr, data);
    mixAttributes(str, data);
    this.data = data;
  }
};

module.exports = Component;
