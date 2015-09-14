require('./vr-register-element');

var THREE = require('../lib/three');
var VRNode = require('./core/vr-node');
var VRUtils = require('./vr-utils');

module.exports = document.registerElement(
  'vr-geometry',
  {
    prototype: Object.create(
      VRNode.prototype, {
        createdCallback: {
          value: function () {
            this.setupGeometry();
            this.load();
          }
        },

        setupGeometry: {
          value: function () {
            var primitive = this.primitive = this.getAttribute('primitive', 'box').toLowerCase();
            var geometry;
            var radius;
            switch (primitive) {
              case 'box':
                var width = this.getAttribute('width', 200);
                var height = this.getAttribute('height', 200);
                var depth = this.getAttribute('depth', 200);
                geometry = new THREE.BoxGeometry(width, height, depth);
                break;
              case 'sphere':
                radius = this.getAttribute('radius', 100);
                geometry = new THREE.SphereGeometry(radius, 32, 32);
                break;
              case 'torus':
                radius = this.getAttribute('radius', 200);
                var tube = this.getAttribute('tube', 10);
                geometry = new THREE.TorusGeometry(radius, tube);
                break;
              default:
                VRUtils.warn('Primitive type not supported');
                break;
            }
            this.geometry = geometry;
            return geometry;
          }
        }
      }
    )
  }
);
