/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('raycaster', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('raycaster', '');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('init', function () {
    test('the raycaster component is initalized', function () {
      assert.isOk(this.el.components.raycaster);
    });
  });
});
