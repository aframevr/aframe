/* global assert, suite, test, setup */
var helpers = require('../../../helpers');

suite('a-obj-model', function () {
  setup(function (done) {
    var el = helpers.entityFactory();
    var objModelEl = this.objModelEl = document.createElement('a-obj-model');
    el.addEventListener('loaded', function () {
      el.sceneEl.appendChild(objModelEl);
    });
    objModelEl.addEventListener('loaded', function () {
      done();
    });
  });

  test('can set obj-model.mtl', function (done) {
    var el = this.objModelEl;
    el.setAttribute('obj-model', 'mtl', 'mymtl.mtl');
    process.nextTick(function () {
      assert.equal(el.getAttribute('obj-model').mtl, 'mymtl.mtl');
      done();
    });
  });

  test('can set obj-model.obj', function (done) {
    var el = this.objModelEl;
    el.setAttribute('obj-model', 'obj', 'myobj.obj');
    process.nextTick(function () {
      assert.equal(el.getAttribute('obj-model').obj, 'myobj.obj');
      done();
    });
  });
});
