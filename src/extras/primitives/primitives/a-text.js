/* Experimental text primitive.
 */
var definePrimitive = require('../primitives').definePrimitive;

definePrimitive('a-text',
  // default component(s) and defaults
  { text: { anchor: 'align', width: 5 } }
  // no other mappings
);
