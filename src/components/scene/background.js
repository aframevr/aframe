/* global THREE */
var register = require('../../core/component').registerComponent;
var COMPONENTS = require('../../core/component').components;

module.exports.Component = register('background', {
  schema: {
    color: {type: 'color', default: 'black'},
    transparent: {default: false},
    generateEnvironment: {default: true}
  },
  update: function () {
    var data = this.data;
    var object3D = this.el.object3D;
    if (data.transparent) {
      object3D.background = null;
      return;
    }
    object3D.background = new THREE.Color(data.color);

    if (data.generateEnvironment) {
      const scene = this.el.sceneEl.object3D;
      const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
      const cubeCamera = new THREE.CubeCamera(1, 100000, cubeRenderTarget);
      this.cubeCamera = cubeCamera;
      this.needsEnvironmentUpdate = true;
      scene.environment = cubeRenderTarget.texture;
      this.el.sceneEl.addEventListener('loaded', function () {
        this.needsEnvironmentUpdate = true;
      });
    }
  },

  tick () {
    if (!this.data.auto && !this.needsEnvironmentUpdate) return;
    const scene = this.el.object3D;
    const renderer = this.el.renderer;
    const camera = this.el.camera;

    this.el.object3D.add(this.cubeCamera);
    this.cubeCamera.position.copy(camera.position);
    this.cubeCamera.update(renderer, scene);
    this.needsEnvironmentUpdate = false;
  },

  remove: function () {
    var data = this.data;
    var object3D = this.el.object3D;
    if (data.transparent) {
      object3D.background = null;
      return;
    }
    object3D.background = COMPONENTS[this.name].schema.color.default;
  }
});
