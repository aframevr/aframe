/* global assert, suite, test, setup */
var helpers = require('../../../helpers');

suite('a-torus', function () {
  setup(function (done) {
    var el = helpers.entityFactory();
    var torusEl = this.torusEl = document.createElement('a-torus');
    el.addEventListener('loaded', function () {
      el.sceneEl.appendChild(torusEl);
    });
    torusEl.addEventListener('loaded', function () {
      done();
    });
  });

  test('has default position when created', function () {
    assert.deepEqual(this.torusEl.getComputedAttribute('position'), {x: 0, y: 0, z: 0});
  });

  test('sets geometry.primitive', function () {
    assert.equal(this.torusEl.getAttribute('geometry').primitive, 'torus');
  });

  test('can set torus properties', function () {
    var geometry;
    var torusEl = this.torusEl;
    torusEl.setAttribute('segments-tubular', '100');
    torusEl.setAttribute('radius', '2');
    torusEl.setAttribute('radius-tubular', '0.1');

    process.nextTick(function () {
      geometry = torusEl.getAttribute('geometry');
      assert.equal(geometry.primitive, 'torus');
      assert.equal(geometry.segmentsTubular, 100);
      assert.equal(geometry.radius, 2);
      assert.equal(geometry.radiusTubular, 0.1);
    });
  });
});
