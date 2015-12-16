var ANode = require('./a-node');
var registerElement = require('./a-register-element').registerElement;

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
