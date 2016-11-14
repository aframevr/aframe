/* global ImageData, URL */
var registerComponent = require('../../core/component').registerComponent;
var THREE = require('../../lib/three');

var VERTEX_SHADER = [
  'attribute vec3 position;',
  'attribute vec2 uv;',
  'uniform mat4 projectionMatrix;',
  'uniform mat4 modelViewMatrix;',
  'varying vec2 vUv;',
  'void main()  {',
  '  vUv = vec2( 1.- uv.x, uv.y );',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
  '}'
].join('\n');

var FRAGMENT_SHADER = [
  'precision mediump float;',
  'uniform samplerCube map;',
  'varying vec2 vUv;',
  '#define M_PI 3.141592653589793238462643383279',
  'void main() {',
  '  vec2 uv = vUv;',
  '  float longitude = uv.x * 2. * M_PI - M_PI + M_PI / 2.;',
  '  float latitude = uv.y * M_PI;',
  '  vec3 dir = vec3(',
  '    - sin( longitude ) * sin( latitude ),',
  '    cos( latitude ),',
  '    - cos( longitude ) * sin( latitude )',
  '  );',
  '  normalize( dir );',
  '  gl_FragColor = vec4( textureCube( map, dir ).rgb, 1.0 );',
  '}'
].join('\n');

/**
 * Component to take screenshots of the scene using a keboard shortcut (alt+s).
 * It can be configured to either take 360&deg; captures (`equirectangular`)
 * or regular screenshots (`projection`)
 *
 * This is based on https://github.com/spite/THREE.CubemapToEquirectangular
 * To capture an equirectangular projection of the scene a THREE.CubeCamera is used
 * The cube map produced by the CubeCamera is projected on a quad and then rendered to
 * WebGLRenderTarget with an ortographic camera.
 */
module.exports.Component = registerComponent('screenshot', {
  schema: {
    width: {default: 4096},
    height: {default: 2048}
  },

  init: function () {
    var el = this.el;
    var self = this;
    if (el.renderer) {
      setup();
    } else {
      el.addEventListener('render-target-loaded', setup);
    }
    function setup () {
      var gl = el.renderer.getContext();
      self.cubeMapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
      self.material = new THREE.RawShaderMaterial({
        uniforms: {map: {type: 't', value: null}},
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        side: THREE.DoubleSide
      });
      self.quad = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1, 1),
        self.material
      );
      self.quad.visible = false;
      self.camera = new THREE.OrthographicCamera(1 / -2, 1 / 2, 1 / 2, 1 / -2, -10000, 10000);
      self.canvas = document.createElement('canvas');
      self.ctx = self.canvas.getContext('2d');
      if (el.camera) { el.camera.add(self.quad); }
      self.onKeyDown = self.onKeyDown.bind(self);
      self.onCameraActive = self.onCameraActive.bind(self);
      el.addEventListener('camera-set-active', self.onCameraActive);
    }
  },

  getRenderTarget: function (width, height) {
    return new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType
    });
  },

  resize: function (width, height) {
    // Resize quad
    this.quad.scale.set(width, height, 1);

    // Resize Camera
    this.camera.left = width / -2;
    this.camera.right = width / 2;
    this.camera.top = height / 2;
    this.camera.bottom = height / -2;
    this.camera.updateProjectionMatrix();

    // Resize canvas
    this.canvas.width = width;
    this.canvas.height = height;
  },

  play: function () {
    window.addEventListener('keydown', this.onKeyDown);
  },

  onCameraActive: function (evt) {
    var cameraParent = this.quad.parent;
    if (cameraParent) { cameraParent.remove(this.quad); }
    evt.detail.cameraEl.getObject3D('camera').add(this.quad);
  },

  /**
   * <ctrl> + <alt> + s = regular screenshot
   * <ctrl> + <alt> + <shift> + s = equirectangular screenshot
   */
  onKeyDown: function (evt) {
    var shortcutPressed = evt.keyCode === 83 && evt.ctrlKey && evt.altKey;
    if (!this.data || !shortcutPressed) { return; }
    var projection = evt.shiftKey ? 'equirectangular' : 'perspective';
    this.capture(projection);
  },

  /**
   * Captures a screenshot of the scene
   *
   * @param {string} projection - Screenshot projection (equirectangular | perspective)
   */
  capture: function (projection) {
    var el = this.el;
    var renderer = el.renderer;
    var size;
    var camera;
    var cubeCamera;
    // Configure camera
    if (projection === 'perspective') {
      // the quad is used for projection in the equirectangular mode
      // we hide it in this case.
      this.quad.visible = false;
      // use scene camera
      camera = el.camera;
      size = renderer.getSize();
    } else {
      // use ortho camera
      camera = this.camera;
      // copy position and rotation of scene camera into the ortho one
      camera.position.copy(el.camera.getWorldPosition());
      camera.rotation.copy(el.camera.getWorldRotation());
      // create cube camera and copy position from scene camera
      cubeCamera = new THREE.CubeCamera(el.camera.near, el.camera.far, Math.min(this.cubeMapSize, 2048));
      cubeCamera.position.copy(el.camera.getWorldPosition());
      cubeCamera.rotation.copy(el.camera.getWorldRotation());
      // render scene with cube camera
      cubeCamera.updateCubeMap(el.renderer, el.object3D);
      this.quad.material.uniforms.map.value = cubeCamera.renderTarget.texture;
      size = {width: this.data.width, height: this.data.height};
      // use quad to project image taken by the cube camera
      this.quad.visible = true;
    }
    this.renderCapture(camera, size, projection);
    // Trigger file download
    this.saveCapture();
  },

  renderCapture: function (camera, size, projection) {
    var autoClear = this.el.renderer.autoClear;
    var el = this.el;
    var imageData;
    var output;
    var pixels;
    var renderer = this.el.renderer;
    // Create rendering target and buffer to store the read pixels
    output = this.getRenderTarget(size.width, size.height);
    pixels = new Uint8Array(4 * size.width * size.height);
    // Resize quad, camera and canvas
    this.resize(size.width, size.height);
    // Render scene to render target
    renderer.autoClear = true;
    renderer.render(el.object3D, camera, output, true);
    renderer.autoClear = autoClear;
    // Read image pizels back
    renderer.readRenderTargetPixels(output, 0, 0, size.width, size.height, pixels);
    if (projection === 'perspective') {
      pixels = this.flipPixelsVertically(pixels, size.width, size.height);
    }
    imageData = new ImageData(new Uint8ClampedArray(pixels), size.width, size.height);
    // Hide quad after projecting the image
    this.quad.visible = false;
    // Copy pixels into canvas
    this.ctx.putImageData(imageData, 0, 0);
  },

  flipPixelsVertically: function (pixels, width, height) {
    var flippedPixels = pixels.slice(0);
    for (var x = 0; x < width; ++x) {
      for (var y = 0; y < height; ++y) {
        flippedPixels[x * 4 + y * width * 4] = pixels[x * 4 + (height - y) * width * 4];
        flippedPixels[x * 4 + 1 + y * width * 4] = pixels[x * 4 + 1 + (height - y) * width * 4];
        flippedPixels[x * 4 + 2 + y * width * 4] = pixels[x * 4 + 2 + (height - y) * width * 4];
        flippedPixels[x * 4 + 3 + y * width * 4] = pixels[x * 4 + 3 + (height - y) * width * 4];
      }
    }
    return flippedPixels;
  },

  saveCapture: function () {
    this.canvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var fileName = 'screenshot-' + document.title + '-' + Date.now() + '.png';
      var aEl = document.createElement('a');
      aEl.href = url;
      aEl.setAttribute('download', fileName);
      aEl.innerHTML = 'downloading...';
      aEl.style.display = 'none';
      document.body.appendChild(aEl);
      setTimeout(function () {
        aEl.click();
        document.body.removeChild(aEl);
      }, 1);
    }, 'image/png');
  }
});
