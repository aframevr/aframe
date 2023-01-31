/* global assert, process, setup, suite, test */
var elFactory = require('../helpers').elFactory;

suite('visible', function () {
  var el;

  setup(function (done) {
    elFactory().then(_el => {
      el = _el;
      el.setAttribute('visible', '');
      done();
    });
  });

  suite('update', function () {
    test('treats empty as true', function () {
      el.setAttribute('visible', '');
      assert.ok(el.object3D.visible);
    });

    test('can set to visible', function () {
      el.setAttribute('visible', true);
      assert.ok(el.object3D.visible);
    });

    test('can set to not visible', function () {
      el.setAttribute('visible', false);
      assert.notOk(el.object3D.visible);
    });
  });
});
