var cssParser = require('parse-css');
var mixin = require('../vr-utils').mixin;

/**
 * The CSS parser returns the attributes
 * in a nested object. We flatten the structure
 * into flat key value pairs
 */
var flattenAttributes = function (attrs) {
  var obj = {};
  attrs.forEach(flatten);
  function flatten (attr) {
    obj[attr.name] = attr.value[1].value;
  }
  return obj;
};

var mixAttributes = function (str, obj) {
  var attrs = str;
  if (!str) { return; }
  // The attributes can come in the form of a string or already pre parsed in an object
  // like rotation, position and scale
  if (typeof str === 'string') {
    attrs = flattenAttributes(cssParser.parseAListOfDeclarations(str));
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
    mixAttributes(styleStr, this.data);
    mixAttributes(str, this.data);
  }
};

module.exports = Component;
