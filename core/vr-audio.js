var VRMarkup = require('@mozvr/vr-markup');

var THREE = VRMarkup.THREE;
var VRObject = VRMarkup.VRObject;

document.registerElement(
  'vr-audio',
  {
    prototype: Object.create(
      VRObject.prototype, {
        createdCallback: {
          value: function () {
            var listener = new THREE.AudioListener();

            var src = this.getAttribute('src');
            var volume = parseFloat(this.getAttribute('vol')) || 10;
            var loop = this.getAttribute('loop') || true;
            var sound = new THREE.Audio(listener);
            volume = volume * 10; // We multiple by ten so the user can define volume in more intuitive scale: 0-10.
            sound.source.start(0, 0);

            if (src) {
              sound.load(src);
              sound.setVolume(volume);
              sound.setLoop(loop);
              sound.connect();
            }

            this.object3D = sound;
            this.load();
          }
        }
      })
  }
);
