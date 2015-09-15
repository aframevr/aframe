var VRMarkup = require('@mozvr/vr-markup');

var THREE = VRMarkup.THREE;
var VRObject = VRMarkup.VRObject;

document.registerElement(
  'vr-model',
  {
    prototype: Object.create(
      VRObject.prototype, {

        createdCallback: {
          value: function () {
            var self = this;
            var src = this.getAttribute('src');

            // The default THREE.ColladaLoader scale of 0.01 ensures scales match across DAE and THREE scene (eg 1m - 1m)
            var scaleBase = 0.01;
            var scaleUser = parseFloat(this.getAttribute('scale')) || 1;
            var scale = scaleBase * scaleUser;

            // TODO: enable user to pass in material, and have that material apply to all nodes in the loaded object.
            // TODO: load and playback animations from loaded models.

            var loader = new THREE.ColladaLoader();
            loader.options.convertUpAxis = true; // Not sure if we need this. Doesn't appear to be the case. But it was in Three.js examples.
            loader.load(src, function (collada) {
              var dae = collada.scene;
              dae.scale.set(scale, scale, scale);
              self.object3D = dae;
              self.load();
            });
          }
        }
      })
  }
);
