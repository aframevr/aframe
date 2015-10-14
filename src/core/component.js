var styleParser = require('style-attr');
var utils = require('../vr-utils');

var mixAttributes = function (str, obj) {
  var attrs = str;
  if (!str) { return; }
  // Attributes can come in the form of a string or pre-parsed as an object
  // such as pos/rot/scale.
  if (typeof str === 'string') {
    attrs = styleParser.parse(str);
  }
  utils.mixin(obj, attrs);
};

var Component = function (el) {
  this.el = el;
  // To store the component specific data
  this.data = {};
  this.parseAttributes();
  this.init();
  this.update();
};

Component.prototype = {
  /**
   * Parses the data coming from the entity attribute
   * and its mixins and calls update
   */
  updateAttributes: function (values) {
    this.parseAttributes(values);
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

  /* Contains the data default values */
  defaults: {},

  /**
   * Parses the data coming from the entity attribute
   * If there are mixins its values will be mixed in
   * Defaults are mixed in first, followed by the mixins
   * and finally the entity attributes that have the highest
   * precedence. Lastly the values are coerced to the
   * types of the defaults
   *  @param  {object} [attrs] It contains the attribute values
   *  @return {undefined}
   */
  parseAttributes: function (attrs) {
    var data = {};
    var el = this.el;
    var elAttrs = attrs || el.getAttribute(this.name);
    var self = this;
    var mixinEls = el.mixinEls;
    utils.mixin(data, this.defaults);
    mixinEls.forEach(applyMixin);
    function applyMixin (mixinEl) {
      var str = mixinEl.getAttribute(self.name);
      if (!str) { return; }
      mixAttributes(str, data);
    }
    mixAttributes(elAttrs, data);
    utils.coerce(data, this.defaults);
    this.data = data;
  },

  parseAttributesString: function (attrs) {
    if (typeof attrs !== 'string') { return attrs; }
    return styleParser.parse(attrs);
  },

  stringifyAttributes: function (attrs) {
    if (typeof attrs !== 'object') { return attrs; }
    return styleParser.stringify(attrs);
  }
};

module.exports = Component;
