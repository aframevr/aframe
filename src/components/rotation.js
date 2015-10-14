var coordinateParser = require('./coordinate-parser');
var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');
var utils = require('../vr-utils');

var proto = {
  update: {
    value: function () {
      var data = this.data;
      var object3D = this.el.object3D;
      // Updates three.js object
      var rotationX = THREE.Math.degToRad(data.x);
      var rotationY = THREE.Math.degToRad(data.y);
      var rotationZ = THREE.Math.degToRad(data.z);
      // Updates three.js object
      object3D.rotation.set(rotationX, rotationY, rotationZ);
    }
  }
};

utils.mixin(proto, coordinateParser);
module.exports.Component = registerComponent('rotation', proto);
