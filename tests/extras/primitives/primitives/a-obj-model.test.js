/* global assert, suite, test, setup */
let helpers = require('../../../helpers');

suite('a-obj-model', function () {
  setup(function (done) {
    let el = helpers.entityFactory();
    let objModelEl = this.objModelEl = document.createElement('a-obj-model');
    el.addEventListener('loaded', function () {
      el.sceneEl.appendChild(objModelEl);
    });
    objModelEl.addEventListener('loaded', function () {
      done();
    });
  });

  test('can set obj-model.mtl', function () {
    let el = this.objModelEl;
    el.setAttribute('mtl', 'mymtl.mtl');
    process.nextTick(function () {
      assert.equal(el.getAttribute('obj-model').mtl, 'url(mymtl.mtl)');
    });
  });

  test('can set obj-model.obj', function () {
    let el = this.objModelEl;
    el.setAttribute('obj', 'myobj.obj');
    process.nextTick(function () {
      assert.equal(el.getAttribute('obj-model').mtl, 'url(myobj.obj)');
    });
  });
});
