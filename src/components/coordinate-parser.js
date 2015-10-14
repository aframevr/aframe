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
      var defaults = this.defaults;
      if (typeof attrs !== 'string') { return attrs; }
      var values = attrs.split(' ');
      return {
        x: parseFloat(values[0] || defaults.x),
        y: parseFloat(values[1] || defaults.y),
        z: parseFloat(values[2] || defaults.z)
      };
    }
  },

  stringifyAttributes: {
    value: function (attrs) {
      if (typeof attrs !== 'object') { return attrs; }
      return [attrs.x, attrs.y, attrs.z].join(' ');
    }
  }
};
