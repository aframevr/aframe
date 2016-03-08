var registerComponent = require('../core/component').registerComponent;

/**
 * Visibility component.
 */
module.exports.Component = registerComponent('fit-texture', {
  dependencies: ['geometry'],
  schema: {
    type: 'boolean',
    default: true
  },

  update: function () {
    if (this.data === false) return;

    var el = this.el;
    var self = this;
    if (self.texture) {
      // If texture has already been loaded, and `fit-texture` was reset.
      self.applyTransformation();
    } else {
      el.addEventListener('material-texture-loaded', function (e) {
        // TODO: It's probably better to set the texture via material.js/texture.js
        // instead of here, so all components could benefit from this info.
        self.texture = e.detail.texture;
        self.applyTransformation();
      });
    }
  },
  applyTransformation: function () {
    var el = this.el;
    var geometry = el.getAttribute('geometry');
    var widthHeightRatio = this.texture.image.height / this.texture.image.width;

    if (geometry.width && geometry.height) {
      console.warn('Using `fit-texture` component on an element with both width and height. Therefore keeping width and changing height to fit the texture. If you want to manually set both width and height, set `fit-texture="false"`. ');
    }
    if (geometry.width) {
      el.setAttribute('height', geometry.width * widthHeightRatio);
    } else if (geometry.height) {
      el.setAttribute('width', geometry.height / widthHeightRatio);
    } else {
      // Neither width nor height is set.
      var tempWidth = 2;
      el.setAttribute('width', '' + tempWidth);
      el.setAttribute('height', tempWidth * widthHeightRatio);
    }
  }
});
