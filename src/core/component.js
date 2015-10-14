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
   * and its mixins and calls update
   */
  updateAttributes: function () {
    this.parseAttributes();
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
   * precedence.
   * Finally the values are coerced to the types of the defaults
   */
  parseAttributes: function () {
    var data = {};
    var entity = this.el;
    var entityAttrs = entity.getAttribute(this.name);
    var self = this;
    var mixinEls = entity.mixinEls;
    utils.mixin(data, this.defaults);
    mixinEls.forEach(applyMixin);
    function applyMixin (mixinEl) {
      var str = mixinEl.getAttribute(self.name);
      if (!str) { return; }
      mixAttributes(str, data);
    }
    mixAttributes(entityAttrs, data);
    utils.coerce(data, this.defaults);
    this.data = data;
  }
};

module.exports = Component;
