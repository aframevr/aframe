var VRMarkup = require('@mozvr/vr-markup');

var THREE = VRMarkup.THREE;
var VRObject = VRMarkup.VRObject;

document.registerElement(
  'vr-skybox',
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
            var size = parseFloat(this.getAttribute('size')) || 10000;
            return new THREE.BoxGeometry(size, size, size, 1, 1, 1);
          }
        },

        getMaterial: {
          value: function () {
            var self = this;

            var urlPrefix = this.getAttribute('src');
            var urls = [
              urlPrefix + 'right.jpg',
              urlPrefix + 'left.jpg',
              urlPrefix + 'top.jpg',
              urlPrefix + 'bottom.jpg',
              urlPrefix + 'front.jpg',
              urlPrefix + 'back.jpg'
            ];

            var textureCube = THREE.ImageUtils.loadTextureCube(urls, THREE.CubeReflectionMapping, function () {
              self.load();
            });
            textureCube.format = THREE.RGBFormat;

            var shader = THREE.ShaderLib.cube;

            var material = new THREE.ShaderMaterial({
              fragmentShader: shader.fragmentShader,
              vertexShader: shader.vertexShader,
              uniforms: shader.uniforms,
              side: THREE.BackSide
            });

            material.uniforms.tCube.value = textureCube;

            return material;
          }
        }
      })
  }
);
