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
            var radius = this.getAttribute('radius', 5);
            var height = this.getAttribute('height', 1);
            var radiusSegments = this.getAttribute('radiusSegments', 36);
            var heightSegments = this.getAttribute('heightSegments', 10);
            var openEnded = this.getAttribute('openended', false);

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
            var color = this.getAttribute('color', 0xCC0000);
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
