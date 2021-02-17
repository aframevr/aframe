/* global THREE */
var register = require('../../core/component').registerComponent;
var COMPONENTS = require('../../core/component').components;

module.exports.Component = register('background', {
  schema: {
    color: {type: 'color', default: 'black'},
    transparent: {default: false},
    generateEnvironment: {default: true}
  },
  init: function () {
    this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
    this.cubeCamera = new THREE.CubeCamera(1, 100000, this.cubeRenderTarget);
    this.needsEnvironmentUpdate = true;
  },
  update: function () {
    var scene = this.el.sceneEl.object3D;
    var data = this.data;
    var object3D = this.el.object3D;
    if (data.transparent) {
      object3D.background = null;
    } else {
      object3D.background = new THREE.Color(data.color);
    }

    if (scene.environment && scene.environment !== this.cubeRenderTarget.texture) {
      console.warn('Background will not overide predefined environment maps');
      return;
    }

    if (data.generateEnvironment) {
      scene.environment = this.cubeRenderTarget.texture;
    } else {
      scene.environment = null;
    }
  },

  tick: function () {
    if (!this.needsEnvironmentUpdate) return;
    var scene = this.el.object3D;
    var renderer = this.el.renderer;
    var camera = this.el.camera;

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
    if (object3D.environment === this.cubeRenderTarget.texture) {
      object3D.environment = null;
    }
    object3D.background = COMPONENTS[this.name].schema.color.default;
  }
});
