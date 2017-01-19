/* Experimental text primitive.
 */
var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../primitives').registerPrimitive;
var utils = require('../../../utils/');

registerPrimitive('a-text', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    'text': {anchor: 'align', width: 5}
  },
  mappings: {
    align: 'text.align',
    anchor: 'text.anchor',
    baseline: 'text.baseline',
    color: 'text.color',
    height: 'text.height',
    letterspacing: 'text.letterSpacing',
    lineheight: 'text.lineHeight',
    font: 'text.font',
    fontimage: 'text.fontImage',
    mode: 'text.mode',
    opacity: 'text.opacity',
    value: 'text.value',
    width: 'text.width',
    wrapcount: 'text.wrapCount',
    wrappixels: 'text.wrapPixels'
  }
}));
