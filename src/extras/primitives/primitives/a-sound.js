var registerPrimitive = require('../registerPrimitive');

registerPrimitive('a-sound', {
  defaultComponents: {
    sound: {}
  },

  mappings: {
    src: 'sound.src',
    on: 'sound.on',
    autoplay: 'sound.autoplay',
    loop: 'sound.loop',
    volume: 'sound.volume'
  }
});
