var VRMarkup = require('@mozvr/vr-markup');

var THREE = VRMarkup.THREE;
var VRObject = VRMarkup.VRObject;

document.registerElement(
  'vr-curvedPlane2',
  {
    prototype: Object.create(
      VRObject.prototype, {
        createdCallback: {
          value: function () {
            var material = this.getMaterial();
            var geometry = this.getGeometry();
            this.object3D = new THREE.Mesh(geometry, material);
            this.load();
          }
        },

        attributeChangedCallback: {
          value: function () {
            var material = this.getMaterial();
            var geometry = this.getGeometry();
            this.object3D.geometry = geometry;
            this.object3D.material = material;
          }
        },

        getGeometry: {
          value: function () {
            var radius = this.getAttribute('radius', 10);
            var height = this.getAttribute('height', 5);
            var thetaStart = this.getAttribute('thetaStart', Math.PI);
            var thetaLength = this.getAttribute('thetaLength', 90);
            var flipNormals = this.getAttribute('flip', false);

            var radiusSegments = thetaLength / 2;
            var heightSegments = 1;
            var length = thetaLength * Math.PI / 180;
            var start;

            if (flipNormals) {
              // Subtracting length from start has effect of enabling designer
              // to specify left edge position of the band (start), and
              // extending band rightwards.
              start = (thetaStart + 180) * Math.PI / 180;
            } else {
              start = (thetaStart - thetaLength) * Math.PI / 180;
            }

            var geometry = new THREE.CylinderGeometry(radius, radius, height, radiusSegments, heightSegments, true, start, length);

            if (flipNormals) {
              geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
            }

            // Sets pivot to top of band.
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0 - height / 2, 0));

            return geometry;
          }
        },

        getMaterial: {
          value: function () {
            var imgSrc = this.getAttribute('tex');
            var color = this.getAttribute('color');
            var opacity = this.getAttribute('opacity', 1);

            var material = new THREE.MeshBasicMaterial({transparent: true, side: THREE.DoubleSide});

            if (imgSrc) {
              material.map = THREE.ImageUtils.loadTexture(imgSrc);
            } else if (color) {
              material.color = new THREE.Color(color);
            } else {
              material.color = new THREE.Color('#CCCCCC');
            }

            material.opacity = opacity;

            return material;
          }
        }
      })
  }
);
