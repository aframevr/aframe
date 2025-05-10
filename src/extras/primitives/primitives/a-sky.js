import getMeshMixin from '../getMeshMixin.js';
import { registerPrimitive } from '../primitives.js';
import * as utils from '../../../utils/index.js';
import meshPrimitives from './meshPrimitives.js';

registerPrimitive('a-sky', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    geometry: {
      primitive: 'sphere',
      radius: 500,
      segmentsWidth: 64,
      segmentsHeight: 32
    },
    material: {
      color: '#FFF',
      side: 'back',
      shader: 'flat',
      minFilter: 'linear'
    },
    scale: '-1 1 1'
  },

  mappings: utils.extendDeep({}, meshPrimitives['a-sphere'].mappings)
}));
