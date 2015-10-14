var utils = require('../vr-utils');

module.exports = {
  defaults: {
    value: {
      x: 0,
      y: 0,
      z: 0
    }
  },

  parseAttributesString: {
    value: function (attrs) {
      return utils.parseCoordinate(attrs, this.defaults);
    }
  },

  stringifyAttributes: {
    value: function (attrs) {
      if (typeof attrs !== 'object') { return attrs; }
      return [attrs.x, attrs.y, attrs.z].join(' ');
    }
  }
};
