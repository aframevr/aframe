/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('link', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('link', '');
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('init', function () {
    test('initialize visual aspect', function () {
      var el = this.el;
      assert.ok(el.components.link.textEl);
      assert.ok(el.components.link.sphereEl);
      assert.ok(el.components.link.semiSphereEl);
    });
  });
});
