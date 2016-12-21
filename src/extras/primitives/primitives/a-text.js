/* Experimental text primitive.
 */

var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../primitives').registerPrimitive;
var utils = require('../../../utils/');

registerPrimitive('a-text', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    'bmfont-text': {anchor: 'align', width: 5}
  },
  mappings: {
    text: 'bmfont-text.text',
    width: 'bmfont-text.width',
    height: 'bmfont-text.height',
    align: 'bmfont-text.align',
    letterspacing: 'bmfont-text.letterSpacing',
    lineheight: 'bmfont-text.lineHeight',
    fnt: 'bmfont-text.fnt',
    fntimage: 'bmfont-text.fntImage',
    mode: 'bmfont-text.mode',
    color: 'bmfont-text.color',
    opacity: 'bmfont-text.opacity',
    anchor: 'bmfont-text.anchor',
    baseline: 'bmfont-text.baseline',
    wrapcount: 'bmfont-text.wrapcount',
    wrappixels: 'bmfont-text.wrappixels'
  }
}));
