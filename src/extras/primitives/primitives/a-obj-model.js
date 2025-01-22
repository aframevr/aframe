import getMeshMixin from '../getMeshMixin.js';
import { registerPrimitive } from '../primitives.js';
import * as utils from '../../../utils/index.js';

registerPrimitive('a-obj-model', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    'obj-model': {}
  },

  mappings: {
    src: 'obj-model.obj',
    mtl: 'obj-model.mtl'
  }
}));
