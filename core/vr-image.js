var VRMarkup = require('@mozvr/vr-markup');

var THREE = VRMarkup.THREE;
var VRObject = VRMarkup.VRObject;

document.registerElement(
  'vr-image',
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
            var width = this.getAttribute('width', 10);
            var height = this.getAttribute('height', 10);

            return new THREE.PlaneGeometry(width, height, 1, 1);

            /* By default we should make dimensions match image size, unless user overrides */
            /* If user does override, they should also have option to have image fit to geometry, or overflow while maintaining proportions */
          }
        },

        getMaterial: {
          value: function () {
            var imgSrc = this.getAttribute('src');
            var material = new THREE.MeshBasicMaterial({ 
              map: THREE.ImageUtils.loadTexture(imgSrc),
              transparent: true,
              side: THREE.DoubleSide 
            });

            /* Would be better to only add transparency if needed. Starting heuristic could be if image type is PNG, for example). */

            return material;
          }
        }
      })
  }
);
