var VRMarkup = require('@mozvr/vr-markup');

var THREE = VRMarkup.THREE;
var VRObject = VRMarkup.VRObject;

document.registerElement(
  'vr-video360',
  {
    prototype: Object.create(
      VRObject.prototype, {
        /**
         * `vr-video360` calls `attributeCreatedCallback` to be DRY.
         *
         * @namespace vr-video360
         */
        createdCallback: {
          value: function () {
            this.attributeChangedCallback();
            this.load();
          },
          configurable: window.debug
        },

        /**
         * Handles `vr-video360` parsing attribute values on initialization and change.
         *
         * @namespace vr-video360
         */
        attributeChangedCallback: {
          value: function () {
            var geometry = this.getGeometry();
            var material = this.getMaterial();

            if (this.hasLoaded) {
              this.object3D.geometry = geometry;
              this.object3D.material = material;
            } else {
              this.object3D = new THREE.Mesh(geometry, material);
            }
          },
          configurable: window.debug
        },

        getGeometry: {
          value: function () {
            var radius = this.getAttribute('radius', 10000);
            return new THREE.SphereGeometry(radius, 64, 40);
          }
        },

        getMaterial: {
          value: function () {
            var video = this.video;
            if (!video) {
              video = this.video = document.createElement('video');
            }
            video.crossOrigin = 'anonymous';
            video.src = this.getAttribute('src');
            video.autoplay = this.getAttribute('autoplay', false);
            video.loop = this.getAttribute('loop', false);

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
