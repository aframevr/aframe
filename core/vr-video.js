var VRMarkup = require('@mozvr/vr-markup');

var THREE = VRMarkup.THREE;
var VRObject = VRMarkup.VRObject;

document.registerElement(
  'vr-video',
  {
    prototype: Object.create(
      VRObject.prototype, {
        /**
         * `vr-video` calls `attributeCreatedCallback` to be DRY.
         *
         * @namespace vr-video
         */
        createdCallback: {
          value: function () {
            this.attributeChangedCallback();
            this.load();
          },
          configurable: window.debug
        },

        /**
         * Handles `vr-video` parsing attribute values on initialization and change.
         *
         * @namespace vr-video
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
            var width = this.getAttribute('width', 50);
            var height = this.getAttribute('height', 50);
            return new THREE.PlaneGeometry(width, height, 1, 1);
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
              map: texture
            });
          }
        }
      }
    )
  }
);
