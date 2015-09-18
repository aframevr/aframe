var VRMarkup = require('@mozvr/vr-markup');

var THREE = VRMarkup.THREE;
var VRObject = VRMarkup.VRObject;

document.registerElement(
  'vr-grid',
  {
    prototype: Object.create(
      VRObject.prototype, {
        createdCallback: {
          value: function () {
            var color = this.getAttribute('color', '#666');
            var material = new THREE.LineBasicMaterial({color: color});
            var geometry = this.generateGeometry();
            this.object3D = new THREE.LineSegments(geometry, material, THREE.LinePieces);
            this.load();
          }
        },

        attributeChangedCallback: {
          value: function () {
            this.object3D.geometry = this.generateGeometry();
          }
        },

        generateGeometry: {
          value: function () {
            var size = this.getAttribute('size', 14);
            var density = this.getAttribute('density', 1);

            // Grid

            var geometry = new THREE.Geometry();

            for (var i = -size; i <= size; i += density) {
              geometry.vertices.push(new THREE.Vector3(-size, -0.04, i));
              geometry.vertices.push(new THREE.Vector3(size, -0.04, i));

              geometry.vertices.push(new THREE.Vector3(i, -0.04, -size));
              geometry.vertices.push(new THREE.Vector3(i, -0.04, size));
            }

            return geometry;
          }
        }
      }
    )
  }
);
