var cssParser = require('parse-css');

var mixinAttributes = function (obj, attrs) {
  attrs.forEach(assignAttr);
  function assignAttr (attr) {
    obj[attr.name] = attr.value[1].value;
  }
};

var Component = function (el) {
  var str = el.getAttribute(this.name);
  this.el = el;
  this.updateAttributes(str);
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
    var attrs;
    var styleStr = this.el.VRStyle && this.el.VRStyle.getAttribute(this.name);
    if (styleStr) {
      attrs = cssParser.parseAListOfDeclarations(styleStr);
      mixinAttributes(this, attrs);
    }
    if (!str) { return; }
    attrs = cssParser.parseAListOfDeclarations(str);
    mixinAttributes(this, attrs);
  }
};

module.exports = Component;
