import getMeshMixin from '../getMeshMixin.js';
import { registerPrimitive } from '../primitives.js';
import * as utils from '../../../utils/index.js';

registerPrimitive('a-video', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    geometry: {
      primitive: 'plane'
    },
    material: {
      color: '#FFF',
      shader: 'flat',
      side: 'double',
      transparent: true
    }
  },

  mappings: {
    height: 'geometry.height',
    width: 'geometry.width'
  }
}));
