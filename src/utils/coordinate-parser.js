var utils = require('../utils/');

module.exports = {
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
