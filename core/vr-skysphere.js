var VRMarkup = require('@mozvr/vr-markup');

var THREE = VRMarkup.THREE;
var VRObject = VRMarkup.VRObject;

document.registerElement(
  'vr-skysphere',
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
            var radius = this.getAttribute('radius', 5000);
            return new THREE.SphereGeometry(radius, 64, 40);
          }
        },

        getMaterial: {
          value: function () {
            var imgSrc = this.getAttribute('src');
            var color = this.getAttribute('color');
            var material = new THREE.MeshBasicMaterial({side: THREE.BackSide, fog: false});

            if (imgSrc) {
              material.map = THREE.ImageUtils.loadTexture(imgSrc);
            } else if (color) {
              material.color = new THREE.Color(color);
            } else {
              material.color = new THREE.Color('#CCCCCC');
            }

            return material;
          }
        }
      })
  }
);
