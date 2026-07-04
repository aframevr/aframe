/* global ImageData, URL */
import { registerComponent } from '../../core/component.js';
import * as THREE from 'three';

// WebGLRenderer uses WebGLCubeRenderTarget, WebGPURenderer uses CubeRenderTarget.
// Written so that Webpack can't statically determine the export used;
// only one of the two exists depending on the three.js build.
var cubeRenderTargetImpl = ['WebGLCubeRenderTarget', 'CubeRenderTarget'].find(function (x) { return THREE[x]; });

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
    this.cubeMapSize = gl.getParameter ? gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE) : 2048;
    // WebGPURenderer does not support RawShaderMaterial, use a node material with TSL.
    if (THREE.TSL) {
      this.material = this.createNodeMaterial();
    } else {
      this.material = new THREE.RawShaderMaterial({
        uniforms: {map: {type: 't', value: null}},
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        side: THREE.DoubleSide
      });
    }
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

  /**
   * TSL (node material) equivalent of the raw GLSL shaders above, used with
   * WebGPURenderer which does not support RawShaderMaterial.
   */
  createNodeMaterial: function () {
    var TSL = THREE.TSL;
    var material = new THREE.MeshBasicNodeMaterial({side: THREE.DoubleSide});
    var uv = TSL.uv();
    var longitude = TSL.float(1).sub(uv.x).mul(2 * Math.PI).sub(Math.PI).add(Math.PI / 2);
    var latitude = uv.y.mul(Math.PI);
    var dir = TSL.vec3(
      TSL.sin(longitude).mul(TSL.sin(latitude)).negate(),
      TSL.cos(latitude),
      TSL.cos(longitude).mul(TSL.sin(latitude)).negate()
    );
    this.cubeTextureNode = TSL.cubeTexture(new THREE.CubeTexture(), dir);
    material.colorNode = TSL.vec4(this.cubeTextureNode.rgb, 1);
    return material;
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
      cubeRenderTarget = new THREE[cubeRenderTargetImpl](
        Math.min(this.cubeMapSize, 2048),
        {
          format: THREE.RGBAFormat,
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
      if (this.cubeTextureNode) {
        this.cubeTextureNode.value = cubeCamera.renderTarget.texture;
      } else {
        this.quad.material.uniforms.map.value = cubeCamera.renderTarget.texture;
      }
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
    var self = this;
    this.setup();
    // Disable VR.
    renderer.xr.enabled = false;
    params = this.setCapture(projection);
    this.renderCapture(params.camera, params.size, params.projection)
      .then(function () {
        // Trigger file download.
        self.saveCapture();
      });
    // Restore VR.
    renderer.xr.enabled = isVREnabled;
  },

  /**
   * Return canvas instead of triggering download (e.g., for uploading blob to server).
   * With WebGLRenderer the canvas is returned synchronously.
   * With WebGPURenderer pixels are read back asynchronously, so a Promise
   * resolving to the canvas is returned instead.
   */
  getCanvas: function (projection) {
    var isVREnabled = this.el.renderer.xr.enabled;
    var renderer = this.el.renderer;
    this.setup();
    // Disable VR.
    var params = this.setCapture(projection);
    renderer.xr.enabled = false;
    var promise = this.renderCapture(params.camera, params.size, params.projection);
    // Restore VR.
    renderer.xr.enabled = isVREnabled;
    if (renderer.readRenderTargetPixels) { return this.canvas; }
    return promise;
  },

  renderCapture: function (camera, size, projection) {
    var autoClear = this.el.renderer.autoClear;
    var el = this.el;
    var output;
    var pixels;
    var renderer = el.renderer;
    var self = this;
    // Create rendering target and buffer to store the read pixels.
    output = this.getRenderTarget(size.width, size.height);
    // Resize quad, camera, and canvas.
    this.resize(size.width, size.height);
    // Render scene to render target.
    renderer.autoClear = true;
    renderer.clear();
    renderer.setRenderTarget(output);
    renderer.render(el.object3D, camera);
    renderer.autoClear = autoClear;
    // Read image pixels back.
    if (renderer.readRenderTargetPixels) {
      pixels = new Uint8Array(4 * size.width * size.height);
      renderer.readRenderTargetPixels(output, 0, 0, size.width, size.height, pixels);
      renderer.setRenderTarget(null);
      this.copyCapture(pixels, size, projection);
      return Promise.resolve(this.canvas);
    }
    // WebGPURenderer only supports reading pixels back asynchronously.
    return renderer.readRenderTargetPixelsAsync(output, 0, 0, size.width, size.height)
      .then(function (pixels) {
        renderer.setRenderTarget(null);
        self.copyCapture(pixels, size, projection);
        return self.canvas;
      });
  },

  copyCapture: function (pixels, size, projection) {
    var imageData;
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
        var from = x * 4 + (height - y - 1) * width * 4;
        var to = x * 4 + y * width * 4;
        flippedPixels[to] = pixels[from];
        flippedPixels[to + 1] = pixels[from + 1];
        flippedPixels[to + 2] = pixels[from + 2];
        flippedPixels[to + 3] = pixels[from + 3];
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
