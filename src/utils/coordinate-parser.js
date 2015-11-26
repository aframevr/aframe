var utils = require('../utils/');

module.exports = {
  parse: {
    value: function (attrs) {
      return utils.parseCoordinate(attrs, this.defaults);
    }
  },

  stringify: {
    value: function (attrs) {
      if (typeof attrs !== 'object') { return attrs; }
      return [attrs.x, attrs.y, attrs.z].join(' ');
    }
  }
};
