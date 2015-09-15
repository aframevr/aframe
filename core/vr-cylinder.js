var VRMarkup = require('@mozvr/vr-markup');

var THREE = VRMarkup.THREE;
var VRObject = VRMarkup.VRObject;

document.registerElement(
  'vr-cylinder',
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
            var radius = parseFloat(this.getAttribute('radius') || 5);
            var height = parseFloat(this.getAttribute('height') || 1);
            var radiusSegments = parseFloat(this.getAttribute('radiusSegments') || 36);
            var heightSegments = parseFloat(this.getAttribute('heightSegments') || 10);
            var openEnded = this.hasAttribute('openended');

            var geometry = new THREE.CylinderGeometry(
              radius, // radius top
              radius, // radius bottom
              height, // height
              radiusSegments, // y segments
              heightSegments, // x segments
              openEnded // openended
            );

            return geometry;
          }
        },

        getMaterial: {
          value: function () {
            var color = parseFloat(this.getAttribute('color')) || 0xCC0000;
            var materialId = this.getAttribute('material');
            var materialEl = materialId ? document.querySelector('#' + materialId) : undefined;
            return (materialEl && materialEl.material) || new THREE.MeshNormalMaterial({
              color: color,
              opacity: 1.0
            });
          }
        }
      })
  }
);
