var registerComponent = require('../core/component').registerComponent;

/**
 * Layer component.
 *
 */
module.exports.Component = registerComponent('layer', {
  schema: {
  },

  init: function () {
    this.initLayer = this.initLayer.bind(this);
    this.el.sceneEl.addEventListener('layersapiready', this.initLayer);
  },

  initLayer: function () {
    var self = this;
    var sceneEl = this.el.sceneEl;
    var sessionReferenceSpaceType = sceneEl.systems.webxr.sessionReferenceSpaceType;

    sceneEl.xrSession.requestReferenceSpace(sessionReferenceSpaceType).then(function (referenceSpace) {
      self.initQuadLayer(referenceSpace);
    });
  },

  initQuadLayer: function (referenceSpace) {
    var self = this;
    var sceneEl = this.el.sceneEl;
    var textureURL = 'comic.png';
    var layer = this.layer = this.system.layerWebGLBinding.createQuadLayer('texture', {
      space: referenceSpace,
      viewPixelHeight: 800,
      viewPixelWidth: 800,
      width: 800,
      height: 800
    });
    sceneEl.systems.material.loadTexture(textureURL, {
      src: textureURL
    }, function (texture) {
      self.texture = texture;
      sceneEl.renderer.setTexture2D(self.texture, 0);
      sceneEl.renderer.xr.addLayer(layer);
    });
  },

  tock: function () {
    var sceneEl = this.el.sceneEl;
    var frame = sceneEl.frame;
    var gl = sceneEl.renderer.getContext();
    var fb;
    var glLayer;
    var glTexture;

    if (!this.texture) { return; }

    glTexture = sceneEl.renderer.properties.get(this.texture).__webglTexture;
    glLayer = this.system.layerWebGLBinding.getSubImage(this.layer, frame);

    fb = gl.createFramebuffer();
    gl.viewport(0, 0, 800, 800);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glTexture, 0);

    gl.bindTexture(gl.TEXTURE_2D, glLayer.colorTexture);
    gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, 800, 800, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fb);
  }
});
