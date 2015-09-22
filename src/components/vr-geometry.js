var cssParser = require('parse-css');
var THREE = require('../../lib/three');
var VRUtils = require('../vr-utils');

exports.parseGeometry = function (str) {
  var attrs;
  var templateStr = this.template && this.template.getAttribute('geometry');
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

module.exports.updateGeometry = function (str) {
  this.parseGeometry(str);
  this.object3D.geometry = this.setupGeometry();
};

module.exports.setupGeometry = function () {
  var primitive = this.primitive;
  var geometry;
  var radius;
  switch (primitive) {
    case 'box':
      var width = this.width || 5;
      var height = this.height || 5;
      var depth = this.depth || 5;
      geometry = new THREE.BoxGeometry(width, height, depth);
      break;
    case 'sphere':
      radius = this.radius || 5;
      geometry = new THREE.SphereGeometry(radius, 32, 32);
      break;
    case 'torus':
      radius = this.radius || 200;
      var tube = this.tube || 10;
      geometry = new THREE.TorusGeometry(radius, tube);
      break;
    default:
      geometry = new THREE.Geometry();
      VRUtils.warn('Primitive type not supported');
      break;
  }
  this.geometry = geometry;
  return geometry;
};
