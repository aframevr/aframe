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
      self.texture = texture;
    });
  },

  tick: function () {
    if (!this.quadLayer) { return; }
    this.updateTransform();
    if (!this.needsRedraw && !this.data.updatesEveryFrame) { return; }
    this.draw();
    this.needsRedraw = false;
  },

  draw: function () {
    var sceneEl = this.el.sceneEl;
    var gl = this.el.sceneEl.renderer.getContext();
    var glayer = this.xrGLFactory.getSubImage(this.quadLayer, sceneEl.frame);

    gl.disable(gl.SCISSOR_TEST);
    gl.disable(gl.DEPTH_TEST);
    gl.viewport(glayer.viewport.x, glayer.viewport.y, glayer.viewport.width, glayer.viewport.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glayer.colorTexture, 0);

    drawQuad(gl);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
    var gl = sceneEl.renderer.getContext();
    var xrSession = sceneEl.xrSession;
    if (!sceneEl.hasWebXR || !XRWebGLBinding || !xrSession) {
      warn('The layer component requires WebXR and the layers API enabled');
      return;
    }
    this.xrGLFactory = new XRWebGLBinding(xrSession, gl);
    initQuad(gl, false);
    xrSession.requestReferenceSpace('local').then(this.onRequestedReferenceSpace);
    this.needsRedraw = true;
  },

  onRequestedReferenceSpace: function (referenceSpace) {
    var xrGLFactory = this.xrGLFactory;
    var sceneEl = this.el.sceneEl;
    this.referenceSpace = referenceSpace;
    this.projectionLayer = xrGLFactory.createProjectionLayer('texture', {
      space: referenceSpace,
      stencil: false
    });

    this.quadLayer = xrGLFactory.createQuadLayer('texture', {
      space: referenceSpace,
      viewPixelHeight: this.data.height,
      viewPixelWidth: this.data.width,
      height: this.data.height,
      width: this.data.width
    });

    sceneEl.renderer.xr.addLayer(this.quadLayer);
    sceneEl.renderer.xr.addLayer(this.projectionLayer);
  }
});

var vertexBuffer;
var shaderProgram;
var indexBuffer;
var indices = [3, 2, 1, 3, 1, 0];

function initQuad (gl, fullscreen) {
  var quadCorner = fullscreen ? 1.0 : 0.5;

  var vertices = [
    -quadCorner, quadCorner, 0.0,
    -quadCorner, -quadCorner, 0.0,
    quadCorner, -quadCorner, 0.0,
    quadCorner, quadCorner, 0.0
  ];

  // Create an empty buffer object to store vertex buffer
  vertexBuffer = gl.createBuffer();

  // Bind appropriate array buffer to it
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Pass the vertex data to the buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Unbind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Create an empty buffer object to store Index buffer
  indexBuffer = gl.createBuffer();

  // Bind appropriate array buffer to it
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // Pass the vertex data to the buffer
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  // Unbind the buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // Vertex shader source code
  var vertCode =
    'attribute vec3 coordinates;' +
    'void main(void) {' +
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
    'void main(void) {' +
        ' gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);' +
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

  // Link both the programs
  gl.linkProgram(shaderProgram);
}

function drawQuad (gl) {
  // Bind vertex buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Bind index buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // Get the attribute location
  var coordinates = gl.getAttribLocation(shaderProgram, 'coordinates');

  // Point an attribute to the currently bound VBO
  gl.vertexAttribPointer(coordinates, 3, gl.FLOAT, false, 0, 0);

  // Enable the attribute
  gl.enableVertexAttribArray(coordinates);

  // Use the combined shader program object
  gl.useProgram(shaderProgram);

  /* ============= Drawing the Quad ================ */

  // Clear the canvas
  gl.clearColor(1.0, 0, 0, 1.0);

  // Enable the depth test
  gl.enable(gl.DEPTH_TEST);

  // Clear the color buffer bit
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the triangle
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Bind index buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}
