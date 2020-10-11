/* global THREE, XRRigidTransform, XRWebGLBinding */
var registerComponent = require('../core/component').registerComponent;
var utils = require('../utils/');
var warn = utils.debug('components:layer:warn');

module.exports.Component = registerComponent('layer', {
  schema: {
    src: {type: 'map'},
    type: {default: 'stereocubemap', oneOf: ['quad', 'monocubemap', 'stereocubemap']},
    rotateCubemap: {default: false}
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
    initQuad(gl);
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
    var type = this.data.type;
    var glayer;
    var xrGLFactory = this.xrGLFactory;
    var frame = this.el.sceneEl.frame;
    var src = this.data.src;

    this.visibilityChanged = false;
    if (!this.layer) { return; }
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
        self.layer.height = self.texture.image.height;
        self.layer.width = self.texture.image.width;
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
        cubeFaceSize, // y pixel count in dest
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
        canvas,
      );
      errorCode = gl.getError();
    });

    // this.el.sceneEl.skipRender = true;
    // this.el.sceneEl.pause();

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
    this.layer = xrGLFactory.createQuadLayer('texture', {
      space: this.referenceSpace,
      viewPixelHeight: 2048,
      viewPixelWidth: 2048,
      height: this.texture.image.height,
      width: this.texture.image.width
    });
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
      height: this.texture.image.height / 1000,
      width: this.texture.image.width / 1000
    });
  },

  draw: function () {
    var sceneEl = this.el.sceneEl;
    var gl = this.el.sceneEl.renderer.getContext();
    var glayer = this.xrGLFactory.getSubImage(this.layer, sceneEl.frame);
    var texture = sceneEl.renderer.properties.get(this.texture).__webglTexture;
    var previousFrameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);

    // gl.disable(gl.SCISSOR_TEST);
    // gl.disable(gl.DEPTH_TEST);

    gl.viewport(glayer.viewport.x, glayer.viewport.y, glayer.viewport.width, glayer.viewport.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glayer.colorTexture, 0);

    // drawQuad(gl, texture, this.data.src);
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
    this.layer.transform = new XRRigidTransform(position, quaternion);
  },

  onEnterVR: function () {
    var sceneEl = this.el.sceneEl;
    var gl = this.el.sceneEl.renderer.getContext();
    var xrSession = sceneEl.xrSession;
    var texture = this.texture;
    if (!sceneEl.hasWebXR || !XRWebGLBinding || !xrSession) {
      warn('The layer component requires WebXR and the layers API enabled');
      return;
    }
    if (texture) { initQuad(gl); }
    xrSession.requestReferenceSpace('local').then(this.onRequestedReferenceSpace);
    this.needsRedraw = true;
    if (this.quadPanelEl) {
      this.quadPanelEl.object3D.visible = false;
    }
    if (this.data.src.play) { this.data.src.play(); }
  },

  onExitVR: function () {
    if (this.quadPanelEl) {
      this.quadPanelEl.object3D.visible = true;
    }
  },

  onRequestedReferenceSpace: function (referenceSpace) {
    this.referenceSpace = referenceSpace;
  }
});

var vertexBuffer;
var shaderProgram;
var indexBuffer;

var indices = [
  1, 2, 3, // top-right
  0, 1, 3 // bottom-left
];

function initQuad (gl) {
  var previousArrayBuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
  var previousElementArrayBuffer = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);

  // x, y, z, u, v
  var vertices = [
    -1.0, 1.0, 0.0, 0, 0,  // bottom-left
    -1.0, -1.0, 0.0, 0, 1, // top-left
    1.0, -1.0, 0.0, 1, 1,  // top-right
    1.0, 1.0, 0.0, 1, 0    // bottom-right
  ];

  // Y coordinates inverted due to Oculus Browser bug.
  // -1,-1 --------------- 1,-1
  //   |                    |
  //   |                    |
  //   |                    |
  //   |                    |
  // -1,1 ---------------- 1,1

  // Create an empty buffer object to store vertex buffer
  vertexBuffer = gl.createBuffer();
  // Bind appropriate array buffer to it
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Pass the vertex data to the buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Create an empty buffer object to store Index buffer
  indexBuffer = gl.createBuffer();
  // Bind appropriate array buffer to it
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  // Pass the vertex data to the buffer
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  // Unbind the buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, previousElementArrayBuffer);
  // Unbind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, previousArrayBuffer);

  // Vertex shader source code
  var vertCode =
    'attribute vec2 texCoordinates;' +
    'attribute vec3 coordinates;' +
    'varying highp vec2 texCoordinatesOut;' +
    'void main(void) {' +
        ' texCoordinatesOut = texCoordinates;' +
        ' gl_Position = vec4(coordinates, 1.0);' +
    '}';

  // Create a vertex shader object
  var vertShader = gl.createShader(gl.VERTEX_SHADER);

  // Attach vertex shader source code
  gl.shaderSource(vertShader, vertCode);

  // Compile the vertex shader
  gl.compileShader(vertShader);

  // Fragment shader source code
  var fragCode =
    'varying highp vec2 texCoordinatesOut;' +
    'uniform sampler2D uSampler;' +
    'void main(void) {' +
        ' gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);' +
        ' gl_FragColor = texture2D(uSampler, texCoordinatesOut);' +
    '}';

  // Create fragment shader object
  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

  // Attach fragment shader source code
  gl.shaderSource(fragShader, fragCode);

  // Compile the fragmentt shader
  gl.compileShader(fragShader);

  // Create a shader program object to
  // store the combined shader program
  shaderProgram = gl.createProgram();

  // Attach a vertex shader
  gl.attachShader(shaderProgram, vertShader);

  // Attach a fragment shader
  gl.attachShader(shaderProgram, fragShader);

  gl.bindAttribLocation(shaderProgram, 7, 'coordinates');
  gl.bindAttribLocation(shaderProgram, 8, 'texCoordinates');

  // Link both the programs
  gl.linkProgram(shaderProgram);
}

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
  gl.blitFramebuffer(0, textureEl.height, textureEl.width, 0, x1offset, y1offset, x2offset, y2offset, gl.COLOR_BUFFER_BIT, gl.NEAREST);

  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
  gl.deleteFramebuffer(xrReadFramebuffer);
}

// function drawQuad (gl, texture, src) {
//   var previousProgram = gl.getParameter(gl.CURRENT_PROGRAM);
//   var previousTexture;
//   var previousCullFace = gl.getParameter(gl.CULL_FACE_MODE);
//   var previousArrayBuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
//   var previousElementArrayBuffer = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);

//   // Use the combined shader program object
//   gl.useProgram(shaderProgram);

//   // Get the attribute location
//   var coordinates = gl.getAttribLocation(shaderProgram, 'coordinates');
//   // Bind vertex buffer object
//   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//   // Point an attribute to the currently bound VBO
//   gl.vertexAttribPointer(coordinates, 3, gl.FLOAT, false, 20, 0);
//   // Enable the attribute
//   gl.enableVertexAttribArray(coordinates);

//   // Get the attribute location
//   var texCoordinates = gl.getAttribLocation(shaderProgram, 'texCoordinates');
//   // Bind index buffer object
//   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
//   // Point an attribute to the currently bound VBO
//   gl.vertexAttribPointer(texCoordinates, 2, gl.FLOAT, false, 20, 12);
//   // Enable the attribute
//   gl.enableVertexAttribArray(texCoordinates);

//   var uSampler = gl.getUniformLocation(shaderProgram, 'uSampler');
//   // Tell WebGL we want to affect texture unit 0
//   gl.activeTexture(gl.TEXTURE0);
//   // Get previously bound texture.
//   previousTexture = gl.getParameter(gl.TEXTURE_BINDING_2D);
//   // Bind the texture to texture unit 0
//   gl.bindTexture(gl.TEXTURE_2D, texture);

//   // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src);

//   // Tell the shader we bound the texture to texture unit 0
//   gl.uniform1i(uSampler, 0);

//   /* ============= Drawing the Quad ================ */

//   gl.enable(gl.CULL_FACE);
//   gl.cullFace(gl.BACK);

//   // Clear the canvas
//   gl.clearColor(1.0, 0, 0, 1.0);
//   // Enable the depth test
//   gl.enable(gl.DEPTH_TEST);
//   // Clear the color buffer bit
//   gl.clear(gl.COLOR_BUFFER_BIT);

//   // Draw the triangle
//   gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

//   // Unbind
//   gl.bindTexture(gl.TEXTURE_2D, previousTexture);

//   // Unbind
//   gl.bindBuffer(gl.ARRAY_BUFFER, previousArrayBuffer);
//   // Unbind index buffer object
//   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, previousElementArrayBuffer);

//   gl.cullFace(previousCullFace);

//   // Restore previous program
//   gl.useProgram(previousProgram);
// }
