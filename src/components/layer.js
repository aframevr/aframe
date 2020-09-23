/* global THREE, XRRigidTransform, XRWebGLBinding */
var registerComponent = require('../core/component').registerComponent;
var utils = require('../utils/');
var warn = utils.debug('components:layer:warn');

module.exports.Component = registerComponent('layer', {
  schema: {
    updatesEveryFrame: {default: false},
    width: {default: 800},
    height: {default: 800},
    src: {type: 'map'}
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
  },

  bindMethods: function () {
    this.onRequestedReferenceSpace = this.onRequestedReferenceSpace.bind(this);
    this.onEnterVR = this.onEnterVR.bind(this);
  },

  update: function (oldData) {
    if (this.data.src !== oldData.src) {
      this.updateSrc();
    }
  },

  updateSrc: function () {
    var src = this.data.src;
    var self = this;
    this.el.sceneEl.systems.material.loadTexture(src, {src: src}, function textureLoaded (texture) {
      var gl = self.el.sceneEl.renderer.getContext();
      self.el.sceneEl.renderer.initTexture(texture);
      self.texture = texture;
      initQuad(gl, texture.image.width, texture.image.height);
    });
  },

  tick: function () {
    if (!this.texture || !this.el.sceneEl.xrSession) { return; }
    if (!this.quadLayer) { this.initQuadLayer(); }
    this.updateTransform();
    if (!this.needsRedraw && !this.data.updatesEveryFrame) { return; }
    this.draw();
    this.needsRedraw = false;
  },

  initQuadLayer: function () {
    var sceneEl = this.el.sceneEl;
    var gl = sceneEl.renderer.getContext();

    this.xrGLFactory = new XRWebGLBinding(sceneEl.xrSession, gl);
    this.quadLayer = this.xrGLFactory.createQuadLayer('texture', {
      space: this.referenceSpace,
      viewPixelHeight: this.texture.image.height,
      viewPixelWidth: this.texture.image.width,
      height: this.texture.image.height,
      width: this.texture.image.width
    });
    sceneEl.renderer.xr.addLayer(this.quadLayer);
  },

  draw: function () {
    var sceneEl = this.el.sceneEl;
    var gl = this.el.sceneEl.renderer.getContext();
    var glayer = this.xrGLFactory.getSubImage(this.quadLayer, sceneEl.frame);
    var texture = sceneEl.renderer.properties.get(this.texture).__webglTexture;
    var previousFrameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);

    // gl.disable(gl.SCISSOR_TEST);
    // gl.disable(gl.DEPTH_TEST);

    gl.viewport(glayer.viewport.x, glayer.viewport.y, glayer.viewport.width, glayer.viewport.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glayer.colorTexture, 0);

    drawQuad(gl, texture);

    gl.bindFramebuffer(gl.FRAMEBUFFER, previousFrameBuffer);
  },

  updateTransform: function () {
    var el = this.el;
    var position = this.position;
    var quaternion = this.quaternion;
    el.object3D.updateMatrixWorld();
    position.setFromMatrixPosition(el.object3D.matrixWorld);
    quaternion.setFromRotationMatrix(el.object3D.matrixWorld);
    this.quadLayer.transform = new XRRigidTransform(position, quaternion);
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
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  // Unbind the buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

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

function drawQuad (gl, texture) {
  var previousProgram = gl.getParameter(gl.CURRENT_PROGRAM);
  var previousTexture;
  var previousCullFace = gl.getParameter(gl.CULL_FACE_MODE);
  var previousArrayBuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
  var previousElementArrayBuffer = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);

  // Use the combined shader program object
  gl.useProgram(shaderProgram);

  // Get the attribute location
  var coordinates = gl.getAttribLocation(shaderProgram, 'coordinates');
  // Bind vertex buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Point an attribute to the currently bound VBO
  gl.vertexAttribPointer(coordinates, 3, gl.FLOAT, false, 20, 0);
  // Enable the attribute
  gl.enableVertexAttribArray(coordinates);

  // Get the attribute location
  var texCoordinates = gl.getAttribLocation(shaderProgram, 'texCoordinates');
  // Bind index buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  // Point an attribute to the currently bound VBO
  gl.vertexAttribPointer(texCoordinates, 2, gl.FLOAT, false, 20, 12);
  // Enable the attribute
  gl.enableVertexAttribArray(texCoordinates);

  var uSampler = gl.getUniformLocation(shaderProgram, 'uSampler');
  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  // Get previously bound texture.
  previousTexture = gl.getParameter(gl.TEXTURE_BINDING_2D);
  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(uSampler, 0);

  /* ============= Drawing the Quad ================ */

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  // Clear the canvas
  gl.clearColor(1.0, 0, 0, 1.0);
  // Enable the depth test
  gl.enable(gl.DEPTH_TEST);
  // Clear the color buffer bit
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the triangle
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  // Unbind
  gl.bindTexture(gl.TEXTURE_2D, previousTexture);

  // Unbind
  gl.bindBuffer(gl.ARRAY_BUFFER, previousArrayBuffer);
  // Unbind index buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, previousElementArrayBuffer);

  gl.cullFace(previousCullFace);

  // Restore previous program
  gl.useProgram(previousProgram);
}
