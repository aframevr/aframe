var VRMarkup = require('@mozvr/vr-markup');

var THREE = VRMarkup.THREE;
var VRObject = VRMarkup.VRObject;

document.registerElement(
  'vr-curvedPlane1',
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
            var radius = parseFloat(this.getAttribute('radius')) || 10;
            var width = parseFloat(this.getAttribute('width')) || 4;
            var height = parseFloat(this.getAttribute('height')) || 1;

            var circumference = 2 * Math.PI * radius;
            var thetaLength = (Math.PI * 2) * (width / circumference);

            var geometry = new THREE.CylinderGeometry(
              radius, // radius top
              radius, // radius bottom
              height, // height
              30, // y segments
              10, // x segments
              true, // openended
              0,  // theta start
              thetaLength
            );

            geometry.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1));

            return geometry;
          }
        },

        getMaterial: {
          value: function () {
            var materialId = this.getAttribute('material');
            var materialEl = materialId ? document.querySelector('#' + materialId) : {};
            return (materialEl && materialEl.material) || new THREE.MeshNormalMaterial({color: Math.random() * 0xffffff, opacity: 1.0});
          }
        }
      })
  }
);
