var cssParser = require('parse-css');
var THREE = require('../../lib/three');

exports.parseCamera = function (str) {
  var attrs;
  var templateStr = this.template && this.template.getAttribute('camera');
  if (templateStr) {
    attrs = cssParser.parseAListOfDeclarations(templateStr);
    this.parseAttributes(attrs);
  }
  if (!str) { return; }
  attrs = cssParser.parseAListOfDeclarations(str);
  this.parseAttributes(attrs);
};

exports.parseAttributes = function (attrs) {
  var self = this;
  attrs.forEach(assignAttr);
  function assignAttr (attr) {
    self[attr.name] = attr.value[1].value;
  }
};

module.exports.updateCamera = function (str) {
  var camera;
  this.parseCamera(str);
  camera = this.camera = this.camera || this.setupCamera();
  // Setting three.js camera parameters
  camera.fov = this.fov || 45;
  camera.near = this.near || 1;
  camera.far = this.far || 10000;
  camera.aspect = this.aspect || window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

module.exports.setupCamera = function () {
  var camera = new THREE.PerspectiveCamera();
  this.object3D.add(camera);
  this.camera = camera;
  return camera;
};
