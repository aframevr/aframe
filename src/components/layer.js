/* global THREE, XRRigidTransform, XRWebGLBinding */
var registerComponent = require('../core/component').registerComponent;
var utils = require('../utils/');
var warn = utils.debug('components:layer:warn');

module.exports.Component = registerComponent('layer', {
  schema: {
    type: {default: 'quad', oneOf: ['quad', 'monocubemap', 'stereocubemap']},
    src: {type: 'map'},
    rotateCubemap: {default: false},
    width: {default: 0},
    height: {default: 0}
  },

  init: function () {
    var gl = this.el.sceneEl.renderer.getContext();

    this.quaternion = new THREE.Quaternion();
    this.position = new THREE.Vector3();

    this.bindMethods();
    this.needsRedraw = false;
    this.frameBuffer = gl.createFramebuffer();
    var requiredFeatures = this.el.sceneEl.getAttribute('webxr').requiredFeatures;
    requiredFeatures.push('layers');
    this.el.sceneEl.getAttribute('webxr', 'requiredFeatures', requiredFeatures);
    this.el.sceneEl.addEventListener('enter-vr', this.onEnterVR);
    this.el.sceneEl.addEventListener('exit-vr', this.onExitVR);
  },

  bindMethods: function () {
    this.onRequestedReferenceSpace = this.onRequestedReferenceSpace.bind(this);
    this.onEnterVR = this.onEnterVR.bind(this);
    this.onExitVR = this.onExitVR.bind(this);
  },

  update: function (oldData) {
    if (this.data.src !== oldData.src) { this.updateSrc(); }
  },

  updateSrc: function () {
    var type = this.data.type;
    this.texture = undefined;
    if (type === 'quad') {
      this.loadQuadImage();
      return;
    }

    if (type === 'monocubemap' || type === 'stereocubemap') {
      this.loadCubeMapImages();
      return;
    }
  },

  loadCubeMapImages: function () {
    var glayer;
    var xrGLFactory = this.xrGLFactory;
    var frame = this.el.sceneEl.frame;
    var src = this.data.src;
    var type = this.data.type;

    this.visibilityChanged = false;
    if (!this.layer) { return; }
    if (type !== 'monocubemap' && type !== 'stereocubemap') { return; }

    if (!src.complete) {
      this.pendingCubeMapUpdate = true;
    } else {
      this.pendingCubeMapUpdate = false;
    }

    if (!this.loadingScreen) {
      this.loadingScreen = true;
    } else {
      this.loadingScreen = false;
    }

    if (type === 'monocubemap') {
      glayer = xrGLFactory.getSubImage(this.layer, frame);
      this.loadCubeMapImage(glayer.colorTexture, src, 0);
    } else {
      glayer = xrGLFactory.getSubImage(this.layer, frame, 'left');
      this.loadCubeMapImage(glayer.colorTexture, src, 0);
      glayer = xrGLFactory.getSubImage(this.layer, frame, 'right');
      this.loadCubeMapImage(glayer.colorTexture, src, 6);
    }
  },

  loadQuadImage: function () {
    var src = this.data.src;
    var self = this;
    this.el.sceneEl.systems.material.loadTexture(src, {src: src}, function textureLoaded (texture) {
      self.el.sceneEl.renderer.initTexture(texture);
      self.texture = texture;
      if (src.tagName === 'VIDEO') { setTimeout(function () { self.textureIsVideo = true; }, 1000); }
      if (self.layer) {
        self.layer.height = self.data.height / 2 || self.texture.image.height / 1000;
        self.layer.width = self.data.width / 2 || self.texture.image.width / 1000;
        self.needsRedraw = true;
      }
      self.updateQuadPanel();
    });
  },

  preGenerateCubeMapTextures: function (src, callback) {
    if (this.data.type === 'monocubemap') {
      this.generateCubeMapTextures(src, 0, callback);
    } else {
      this.generateCubeMapTextures(src, 0, callback);
      this.generateCubeMapTextures(src, 6, callback);
    }
  },

  generateCubeMapTextures: function (src, faceOffset, callback) {
    var data = this.data;
    var cubeFaceSize = this.cubeFaceSize;
    var textureSourceCubeFaceSize = Math.min(src.width, src.height);
    var cubefaceTextures = [];
    var imgTmp0;
    var imgTmp2;

    for (var i = 0; i < 6; i++) {
      var tempCanvas = document.createElement('CANVAS');
      tempCanvas.width = tempCanvas.height = cubeFaceSize;
      var tempCanvasContext = tempCanvas.getContext('2d');

      if (data.rotateCubemap) {
        if (i === 2 || i === 3) {
          tempCanvasContext.save();
          tempCanvasContext.translate(cubeFaceSize, cubeFaceSize);
          tempCanvasContext.rotate(Math.PI);
        }
      }

      // Note that this call to drawImage will not only copy the bytes to the
      // canvas but also could resized the image if our cube face size is
      // smaller than the source image due to GL max texture size.
      tempCanvasContext.drawImage(
        src,
        (i + faceOffset) * textureSourceCubeFaceSize, // top left x coord in source
        0, // top left y coord in source
        textureSourceCubeFaceSize, // x pixel count from source
        textureSourceCubeFaceSize, // y pixel count from source
        0, // dest x offset in the canvas
        0, // dest y offset in the canvas
        cubeFaceSize, // x pixel count in dest
        cubeFaceSize  // y pixel count in dest
      );

      tempCanvasContext.restore();

      if (callback) { callback(); }
      cubefaceTextures.push(tempCanvas);
    }

    if (data.rotateCubemap) {
      imgTmp0 = cubefaceTextures[0];
      imgTmp2 = cubefaceTextures[1];

      cubefaceTextures[0] = imgTmp2;
      cubefaceTextures[1] = imgTmp0;

      imgTmp0 = cubefaceTextures[4];
      imgTmp2 = cubefaceTextures[5];

      cubefaceTextures[4] = imgTmp2;
      cubefaceTextures[5] = imgTmp0;
    }

    if (callback) { callback(); }
    return cubefaceTextures;
  },

  loadCubeMapImage: function (layerColorTexture, src, faceOffset) {
    var gl = this.el.sceneEl.renderer.getContext();
    var cubefaceTextures;

    // dont flip the pixels as we load them into the texture buffer.
    // TEXTURE_CUBE_MAP expects the Y to be flipped for the faces and it already
    // is flipped in our texture image.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, layerColorTexture);

    if (!src.complete || this.loadingScreen) {
      cubefaceTextures = this.loadingScreenImages;
    } else {
      cubefaceTextures = this.generateCubeMapTextures(src, faceOffset);
    }

    var errorCode = 0;
    cubefaceTextures.forEach(function (canvas, i) {
      gl.texSubImage2D(
        gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
        0,
        0, 0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        canvas
      );
      errorCode = gl.getError();
    });

    if (errorCode !== 0) {
      console.log('renderingError, WebGL Error Code: ' + errorCode);
    }
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  },

  tick: function () {
    if (!this.el.sceneEl.xrSession) { return; }
    if (!this.layer && this.el.sceneEl.is('vr-mode')) { this.initLayer(); }
    this.updateTransform();
    if (this.data.src.complete && (this.pendingCubeMapUpdate || this.loadingScreen || this.visibilityChanged)) { this.loadCubeMapImages(); }
    if (!this.needsRedraw && !this.layer.needsRedraw && !this.textureIsVideo) { return; }
    if (this.data.type === 'quad') { this.draw(); }
    this.needsRedraw = false;
  },

  initLayer: function () {
    var self = this;
    var type = this.data.type;

    this.el.sceneEl.xrSession.onvisibilitychange = function (evt) {
      self.visibilityChanged = evt.session.visibilityState !== 'hidden';
    };

    if (type === 'quad') {
      this.initQuadLayer();
      return;
    }

    if (type === 'monocubemap' || type === 'stereocubemap') {
      this.initCubeMapLayer();
      return;
    }
  },

  initQuadLayer: function () {
    var sceneEl = this.el.sceneEl;
    var gl = sceneEl.renderer.getContext();
    var xrGLFactory = this.xrGLFactory = new XRWebGLBinding(sceneEl.xrSession, gl);
    if (!this.texture) { return; }
    this.layer = xrGLFactory.createQuadLayer({
      space: this.referenceSpace,
      viewPixelHeight: 2048,
      viewPixelWidth: 2048,
      height: this.data.height / 2 || this.texture.image.height / 1000,
      width: this.data.width / 2 || this.texture.image.width / 1000
    });
    this.initLoadingScreenImages();
    sceneEl.renderer.xr.addLayer(this.layer);
  },

  initCubeMapLayer: function () {
    var src = this.data.src;
    var sceneEl = this.el.sceneEl;
    var gl = sceneEl.renderer.getContext();
    var glSizeLimit = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    var cubeFaceSize = this.cubeFaceSize = Math.min(glSizeLimit, Math.min(src.width, src.height));
    var xrGLFactory = this.xrGLFactory = new XRWebGLBinding(sceneEl.xrSession, gl);
    this.layer = xrGLFactory.createCubeLayer({
      space: this.referenceSpace,
      viewPixelWidth: cubeFaceSize,
      viewPixelHeight: cubeFaceSize,
      layout: this.data.type === 'monocubemap' ? 'mono' : 'stereo',
      isStatic: false
    });

    this.initLoadingScreenImages();
    this.loadCubeMapImages();
    sceneEl.renderer.xr.addLayer(this.layer);
  },

  initLoadingScreenImages: function () {
    var cubeFaceSize = this.cubeFaceSize;
    var loadingScreenImages = this.loadingScreenImages = [];
    for (var i = 0; i < 6; i++) {
      var tempCanvas = document.createElement('CANVAS');
      tempCanvas.width = tempCanvas.height = cubeFaceSize;
      var tempCanvasContext = tempCanvas.getContext('2d');
      tempCanvas.width = tempCanvas.height = cubeFaceSize;
      tempCanvasContext.fillStyle = 'black';
      tempCanvasContext.fillRect(0, 0, cubeFaceSize, cubeFaceSize);
      if (i !== 2 && i !== 3) {
        tempCanvasContext.translate(cubeFaceSize, 0);
        tempCanvasContext.scale(-1, 1);
        tempCanvasContext.fillStyle = 'white';
        tempCanvasContext.font = '30px Arial';
        tempCanvasContext.fillText('Loading', cubeFaceSize / 2, cubeFaceSize / 2);
      }
      loadingScreenImages.push(tempCanvas);
    }
  },

  destroyLayer: function () {
    if (!this.layer) { return; }
    this.el.sceneEl.renderer.xr.removeLayer(this.layer);
    this.layer.destroy();
    this.layer = undefined;
  },

  toggleCompositorLayer: function () {
    this.enableCompositorLayer(!this.layerEnabled);
  },

  enableCompositorLayer: function (enable) {
    this.layerEnabled = enable;
    this.quadPanelEl.object3D.visible = !this.layerEnabled;
  },

  updateQuadPanel: function () {
    var quadPanelEl = this.quadPanelEl;
    if (!this.quadPanelEl) {
      quadPanelEl = this.quadPanelEl = document.createElement('a-entity');
      this.el.appendChild(quadPanelEl);
    }

    quadPanelEl.setAttribute('material', {
      shader: 'flat',
      src: this.data.src,
      transparent: true
    });

    quadPanelEl.setAttribute('geometry', {
      primitive: 'plane',
      height: this.data.height || this.texture.image.height / 1000,
      width: this.data.width || this.texture.image.height / 1000
    });
  },

  draw: function () {
    var sceneEl = this.el.sceneEl;
    var gl = this.el.sceneEl.renderer.getContext();
    var glayer = this.xrGLFactory.getSubImage(this.layer, sceneEl.frame);
    var texture = sceneEl.renderer.properties.get(this.texture).__webglTexture;
    var previousFrameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);

    gl.viewport(glayer.viewport.x, glayer.viewport.y, glayer.viewport.width, glayer.viewport.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glayer.colorTexture, 0);

    blitTexture(gl, texture, glayer, this.data.src);

    gl.bindFramebuffer(gl.FRAMEBUFFER, previousFrameBuffer);
  },

  updateTransform: function () {
    var el = this.el;
    var position = this.position;
    var quaternion = this.quaternion;
    el.object3D.updateMatrixWorld();
    position.setFromMatrixPosition(el.object3D.matrixWorld);
    quaternion.setFromRotationMatrix(el.object3D.matrixWorld);
    if (!this.layerEnabled) { position.set(0, 0, 100000000); }
    this.layer.transform = new XRRigidTransform(position, quaternion);
  },

  onEnterVR: function () {
    var sceneEl = this.el.sceneEl;
    var xrSession = sceneEl.xrSession;
    if (!sceneEl.hasWebXR || !XRWebGLBinding || !xrSession) {
      warn('The layer component requires WebXR and the layers API enabled');
      return;
    }
    xrSession.requestReferenceSpace('local-floor').then(this.onRequestedReferenceSpace);
    this.needsRedraw = true;
    this.layerEnabled = true;
    if (this.quadPanelEl) {
      this.quadPanelEl.object3D.visible = false;
    }
    if (this.data.src.play) { this.data.src.play(); }
  },

  onExitVR: function () {
    if (this.quadPanelEl) {
      this.quadPanelEl.object3D.visible = true;
    }
    this.destroyLayer();
  },

  onRequestedReferenceSpace: function (referenceSpace) {
    this.referenceSpace = referenceSpace;
  }
});

function blitTexture (gl, texture, subImage, textureEl) {
  var xrReadFramebuffer = gl.createFramebuffer();
  let x1offset = subImage.viewport.x;
  let y1offset = subImage.viewport.y;
  let x2offset = subImage.viewport.x + subImage.viewport.width;
  let y2offset = subImage.viewport.y + subImage.viewport.height;

  // Update video texture.
  if (textureEl.tagName === 'VIDEO') {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, textureEl.width, textureEl.height, gl.RGB, gl.UNSIGNED_BYTE, textureEl);
  }

  // Bind texture to read framebuffer.
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, xrReadFramebuffer);
  gl.framebufferTexture2D(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  // Blit into layer buffer.
  gl.readBuffer(gl.COLOR_ATTACHMENT0);
  gl.blitFramebuffer(0, 0, textureEl.width, textureEl.height, x1offset, y1offset, x2offset, y2offset, gl.COLOR_BUFFER_BIT, gl.NEAREST);

  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
  gl.deleteFramebuffer(xrReadFramebuffer);
}
