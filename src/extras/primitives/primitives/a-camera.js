var registerPrimitive = require('../registerPrimitive');

registerPrimitive('a-camera', {
  defaultComponents: {
    camera: {},
    controls: {}
  },

  mappings: {
    active: 'camera.active',
    far: 'camera.far',
    fov: 'camera.fov',
    near: 'camera.near',
    zoom: 'camera.zoom',
    'position-controls-enabled': 'controls.positionControlsEnabled',
    'rotation-controls-enabled': 'controls.rotationControlsEnabled'
  },

  deprecatedMappings: {
    'cursor-color': 'a-camera[cursor-color] has been removed. Use a-cursor[color] instead.',
    'cursor-maxdistance': 'a-camera[cursor-maxdistance] has been removed. Use a-cursor[max-distance] instead.',
    'cursor-offset': 'a-camera[cursor-offset] has been removed. Use a-cursor[position] instead.',
    'cursor-opacity': 'a-camera[cursor-offset] has been removed. Use a-cursor[opacity] instead.',
    'cursor-scale': 'a-camera[cursor-scale] has been removed. Use a-cursor[scale] instead.',
    'cursor-visible': 'a-camera[cursor-visible] has been removed. Use a-cursor[visible] instead.'
  }
});
