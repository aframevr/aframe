var ANode = require('./a-node');
var re = require('../a-register-element');
var registerElement = re.registerElement;

/**
 * TODO: Block on assets before loading.
 */
module.exports = registerElement('a-assets', {
  prototype: Object.create(ANode.prototype, {
    load: {
      value: function () {
        ANode.prototype.load.call(this);
      }
    }
  })
});
