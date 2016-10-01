/**
 * Common mesh defaults, mappings, and transforms.
 */
module.exports = function getMeshMixin () {
  return {
    defaultComponents: {
      material: {}
    },

    mappings: {
      color: 'material.color',
      metalness: 'material.metalness',
      opacity: 'material.opacity',
      repeat: 'material.repeat',
      roughness: 'material.roughness',
      shader: 'material.shader',
      side: 'material.side',
      src: 'material.src',
      transparent: 'material.transparent'
    },

    transforms: {
      src: function (value) {
        // Selector.
        if (value[0] === '#') { return value; }
        // Inline url().
        return 'url(' + value + ')';
      }
    }
  };
};
