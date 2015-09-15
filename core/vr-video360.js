var VRMarkup = require('@mozvr/vr-markup');

var THREE = VRMarkup.THREE;
var VRObject = VRMarkup.VRObject;

document.registerElement(
  'vr-video360',
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

        /* no `update` function needed */

        getGeometry: {
          value: function () {
            var radius = parseFloat(this.getAttribute('radius') || 10000);
            return new THREE.SphereGeometry(radius, 64, 40);
          }
        },

        getMaterial: {
          value: function () {
            var video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            video.src = this.getAttribute('src');
            video.autoplay = this.hasAttribute('autoplay');
            video.loop = this.hasAttribute('loop');

            var texture = new THREE.VideoTexture(video);
            texture.minFilter = THREE.LinearFilter;
            texture.format = THREE.RGBFormat;

            texture.generateMipmaps = false;

            return new THREE.MeshBasicMaterial({
              map: texture,
              side: THREE.DoubleSide
            });
          }
        }
      }
    )
  }
);
