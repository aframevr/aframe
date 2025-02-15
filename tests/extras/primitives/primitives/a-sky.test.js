/* global assert, suite, test, setup */
import * as helpers from '../../../helpers.js';

suite('a-sky', function () {
  setup(function (done) {
    var parentEl = helpers.entityFactory();
    var skyEl = this.el = document.createElement('a-sky');
    parentEl.addEventListener('loaded', function () {
      parentEl.sceneEl.appendChild(skyEl);
    });
    skyEl.addEventListener('loaded', function () {
      done();
    });
  });

  test('can set theta-length', function (done) {
    this.el.setAttribute('theta-length', 90);
    setTimeout(() => {
      assert.equal(this.el.getAttribute('geometry').thetaLength, 90);
      done();
    });
  });

  test('can set radius', function (done) {
    this.el.setAttribute('radius', 30);
    setTimeout(() => {
      assert.equal(this.el.getAttribute('geometry').radius, 30);
      done();
    });
  });
});
