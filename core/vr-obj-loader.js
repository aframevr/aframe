var VRMarkup = require('@mozvr/vr-markup');

var THREE = VRMarkup.THREE;
var VRObject = VRMarkup.VRObject;

document.registerElement(
  'vr-obj-loader',
  {
    prototype: Object.create(
      VRObject.prototype, {

        createdCallback: {
          value: function () {
            var self = this;
            var src = this.getAttribute('src');
            var material = this.getMaterial();

            // OBJ
            var manager = new THREE.LoadingManager();
            manager.onProgress = function (item, loaded, total) {
              console.log(item, loaded, total);
            };

            var loader = new THREE.OBJLoader(manager);
            loader.load(src, function (object) {
              object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                  child.geometry.computeTangents();
                  child.material = material;
                }
              });
              object.position.y = -15;
              self.object3D = object;
              self.load();
            });
          }
        },

        getMaterial: {
          value: function () {
            var materialId = this.getAttribute('material');
            var materialEl = materialId ? document.querySelector('#' + materialId) : undefined;
            return materialEl && materialEl.material;
          }
        }

      })
  }
);
