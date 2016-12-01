var components = require('../../core/component').components;
var THREE = require('../../lib/three');

var Loader = module.exports.Loader = function (sceneEl) {
  var camera = this.camera = new THREE.PerspectiveCamera();
  var geometry = new THREE.SphereGeometry(0.25, 36, 18);
  var material = new THREE.MeshBasicMaterial({color: '#ef2d5e'});
  var mesh = this.mesh = new THREE.Mesh(geometry, material);
  var loaderAttr = sceneEl.getAttribute('loader');
  var hasLoader = loaderAttr !== 'false';
  if (!hasLoader) { return; }
  this.loaderTime = parseFloat(loaderAttr);
  this.sceneEl = sceneEl;
  this.scene = new THREE.Scene();
  this.sceneRender = sceneEl.render;
  // save original clear color.
  this.rendererClearColor = sceneEl.renderer.getClearColor().getHexString();
  sceneEl.renderer.setClearColor(0x000000);
  camera.near = components.camera.schema.near.default;
  camera.far = components.camera.schema.far.default;
  camera.fov = components.camera.schema.fov.default;
  camera.position.set(0, 0, 2);
  sceneEl.addEventListener('renderstart', this.stop.bind(this));
  this.scene.add(mesh);
  this.render = this.render.bind(this);
  sceneEl.render = function () { };
  this.render(0);
};

Loader.prototype = {
  render: function (time) {
    var effect = this.sceneEl.effect;
    var timeDelta = time !== 0 ? time - this.time : 0;
    if (this.stopped) { return; }
    effect.requestAnimationFrame(this.render);
    this.tick(time, timeDelta);
    this.sceneEl.renderer.clear();
    effect.render(this.scene, this.camera);
    this.time = time;
  },

  stop: function () {
    var self = this;
    setTimeout(function () {
      // Restore original clear color.
      self.sceneEl.renderer.setClearColor(this.rendererClearColor);
      self.stopped = true;
      self.sceneEl.render = self.sceneRender;
      self.sceneEl.render(0);
    }, this.loaderTime);
  },

  resize: function (size) {
    this.camera.aspect = size.width / size.height;
    this.camera.updateProjectionMatrix();
  },

  tick: function (time, delta) {
    var scaleTime = (time / 1500 % 1.5);
    var newScale = 1.0 + 0.15 * Math.sin(scaleTime * 6.2831 * 3.0) * Math.exp(-scaleTime * 4.0);
    // pulses hardcoded value
    // [[413, 413, 413], [412, 412, 412], [411, 411, 411], [409, 409, 409], [409, 409, 409], [437, 437, 437], [430, 430, 437], [418, 418, 418], [413, 413, 413], [412, 412, 412], [418, 418, 418], [425, 425, 425], [423, 423, 423], [419, 419, 419], [415, 415, 415], [413, 413, 413]]
    // normalizalos by dividing by 413
    // 24 fps
    this.mesh.scale.set(newScale, newScale, newScale);
  }
};
