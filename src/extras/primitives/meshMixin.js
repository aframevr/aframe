/**
 * Common mesh defaults, mappings, and transforms.
 */
module.exports = function getMeshMixin () {
  return {
    defaultAttributes: {
      material: { }
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
      translate: 'geometry.translate',
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
