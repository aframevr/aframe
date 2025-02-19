/* global ImageData, URL */
import { registerComponent } from '../../core/component.js';
import * as THREE from 'three';

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
 * Component to take screenshots of the scene using a keyboard shortcut (alt+s).
 * It can be configured to either take 360&deg; captures (`equirectangular`)
 * or regular screenshots (`projection`)
 *
 * This is based on https://github.com/spite/THREE.CubemapToEquirectangular
 * To capture an equirectangular projection of the scene a THREE.CubeCamera is used
 * The cube map produced by the CubeCamera is projected on a quad and then rendered to
 * WebGLRenderTarget with an orthographic camera.
 */
export var Component = registerComponent('screenshot', {
  schema: {
    width: {default: 4096},
    height: {default: 2048},
    camera: {type: 'selector'}
  },

  sceneOnly: true,

  setup: function () {
    var el = this.el;
    if (this.canvas) { return; }
    var gl = el.renderer.getContext();
    if (!gl) { return; }
    this.cubeMapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    this.material = new THREE.RawShaderMaterial({
      uniforms: {map: {type: 't', value: null}},
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      side: THREE.DoubleSide
    });
    this.quad = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      this.material
    );
    this.quad.visible = false;
    this.camera = new THREE.OrthographicCamera(-1 / 2, 1 / 2, 1 / 2, -1 / 2, -10000, 10000);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    el.object3D.add(this.quad);
    this.onKeyDown = this.onKeyDown.bind(this);
  },

  getRenderTarget: function (width, height) {
    return new THREE.WebGLRenderTarget(width, height, {
      colorSpace: this.el.sceneEl.renderer.outputColorSpace,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType
    });
  },

  resize: function (width, height) {
    // Resize quad.
    this.quad.scale.set(width, height, 1);

    // Resize camera.
    this.camera.left = -1 * width / 2;
    this.camera.right = width / 2;
    this.camera.top = height / 2;
    this.camera.bottom = -1 * height / 2;
    this.camera.updateProjectionMatrix();

    // Resize canvas.
    this.canvas.width = width;
    this.canvas.height = height;
  },

  play: function () {
    window.addEventListener('keydown', this.onKeyDown);
  },

  /**
   * <ctrl> + <alt> + s = Regular screenshot.
   * <ctrl> + <alt> + <shift> + s = Equirectangular screenshot.
  */
  onKeyDown: function (evt) {
    var shortcutPressed = evt.keyCode === 83 && evt.ctrlKey && evt.altKey;
    if (!this.data || !shortcutPressed) { return; }
    var projection = evt.shiftKey ? 'equirectangular' : 'perspective';
    this.capture(projection);
  },

  /**
   * Capture a screenshot of the scene.
   *
   * @param {string} projection - Screenshot projection (equirectangular or perspective).
   */
  setCapture: function (projection) {
    var el = this.el;
    var size;
    var camera;
    var cubeCamera;
    var cubeRenderTarget;
    // Configure camera.
    if (projection === 'perspective') {
      // Quad is only used in equirectangular mode. Hide it in this case.
      this.quad.visible = false;
      // Use scene camera.
      camera = (this.data.camera && this.data.camera.components.camera.camera) || el.camera;
      size = {width: this.data.width, height: this.data.height};
    } else {
      // Use ortho camera.
      camera = this.camera;
      cubeRenderTarget = new THREE.WebGLCubeRenderTarget(
        Math.min(this.cubeMapSize, 2048),
        {
          format: THREE.RGBFormat,
          generateMipmaps: true,
          minFilter: THREE.LinearMipmapLinearFilter,
          colorSpace: THREE.SRGBColorSpace
        });
      // Create cube camera and copy position from scene camera.
      cubeCamera = new THREE.CubeCamera(el.camera.near, el.camera.far, cubeRenderTarget);
      // Copy camera position into cube camera;
      el.camera.getWorldPosition(cubeCamera.position);
      el.camera.getWorldQuaternion(cubeCamera.quaternion);
      // Render scene with cube camera.
      cubeCamera.update(el.renderer, el.object3D);
      this.quad.material.uniforms.map.value = cubeCamera.renderTarget.texture;
      size = {width: this.data.width, height: this.data.height};
      // Use quad to project image taken by the cube camera.
      this.quad.visible = true;
    }
    return {
      camera: camera,
      size: size,
      projection: projection
    };
  },

  /**
   * Maintained for backwards compatibility.
   */
  capture: function (projection) {
    var isVREnabled = this.el.renderer.xr.enabled;
    var renderer = this.el.renderer;
    var params;
    this.setup();
    // Disable VR.
    renderer.xr.enabled = false;
    params = this.setCapture(projection);
    this.renderCapture(params.camera, params.size, params.projection);
    // Trigger file download.
    this.saveCapture();
    // Restore VR.
    renderer.xr.enabled = isVREnabled;
  },

  /**
   * Return canvas instead of triggering download (e.g., for uploading blob to server).
   */
  getCanvas: function (projection) {
    var isVREnabled = this.el.renderer.xr.enabled;
    var renderer = this.el.renderer;
    this.setup();
    // Disable VR.
    var params = this.setCapture(projection);
    renderer.xr.enabled = false;
    this.renderCapture(params.camera, params.size, params.projection);
    // Restore VR.
    renderer.xr.enabled = isVREnabled;
    return this.canvas;
  },

  renderCapture: function (camera, size, projection) {
    var autoClear = this.el.renderer.autoClear;
    var el = this.el;
    var imageData;
    var output;
    var pixels;
    var renderer = el.renderer;
    // Create rendering target and buffer to store the read pixels.
    output = this.getRenderTarget(size.width, size.height);
    pixels = new Uint8Array(4 * size.width * size.height);
    // Resize quad, camera, and canvas.
    this.resize(size.width, size.height);
    // Render scene to render target.
    renderer.autoClear = true;
    renderer.clear();
    renderer.setRenderTarget(output);
    renderer.render(el.object3D, camera);
    renderer.autoClear = autoClear;
    // Read image pixels back.
    renderer.readRenderTargetPixels(output, 0, 0, size.width, size.height, pixels);
    renderer.setRenderTarget(null);
    if (projection === 'perspective') {
      pixels = this.flipPixelsVertically(pixels, size.width, size.height);
    }
    imageData = new ImageData(new Uint8ClampedArray(pixels), size.width, size.height);
    // Hide quad after projecting the image.
    this.quad.visible = false;
    // Copy pixels into canvas.
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

  /**
   * Download capture to file.
   */
  saveCapture: function () {
    this.canvas.toBlob(function (blob) {
      var fileName = 'screenshot-' + document.title.toLowerCase() + '-' + Date.now() + '.png';
      var linkEl = document.createElement('a');
      var url = URL.createObjectURL(blob);
      linkEl.href = url;
      linkEl.setAttribute('download', fileName);
      linkEl.innerHTML = 'downloading...';
      linkEl.style.display = 'none';
      document.body.appendChild(linkEl);
      setTimeout(function () {
        linkEl.click();
        document.body.removeChild(linkEl);
      }, 1);
    }, 'image/png');
  }
});
