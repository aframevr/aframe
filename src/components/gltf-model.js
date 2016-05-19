var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

var GLTFLoader = THREE.glTFLoader; // To appease the linter
var loader = new GLTFLoader();
var gltf = null;

module.exports.Component = registerComponent('gltf-model', {
  schema: {
    src: {type: 'src'},
    loop: {default: true},
    auto: {default: true}
  },

  init: function () {
    this.model = null;
  },

  update: function () {
    var self = this;
    var el = this.el;
    var src = this.data.src;
    var loop = this.data.loop;
    var auto = this.data.auto;

    if (!src) { return; }

    this.remove();

    loader.load(src, function (gltfModel) {
      var i = null;
      var len = null;
      var animation = null;
      gltf = gltfModel;

      self.model = gltfModel.scene;
      el.setObject3D('mesh', self.model);
      el.emit('model-loaded', {format: 'gltf', model: self.model});

      if (gltf.animations && gltf.animations.length) {
        len = gltf.animations.length;
        for (i = 0; i < len; i++) {
          animation = gltf.animations[i];
          animation.loop = loop;
          if (auto) {
            animation.play();
          }
        }
      }
    });
  },

  remove: function () {
    if (!this.model) { return; }
    this.el.removeObject3D('mesh');
  }
});
