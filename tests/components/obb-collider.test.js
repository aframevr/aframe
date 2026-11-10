/* global assert, setup, suite, test, THREE */
import { elFactory, once } from '../helpers.js';

suite('obb-collider', function () {
  setup(function (done) {
    var self = this;
    elFactory().then(function (parentEl) {
      var el = self.el = document.createElement('a-entity');
      var childEl = self.childEl = document.createElement('a-entity');
      self.parentEl = parentEl;
      childEl.setAttribute('geometry', 'primitive: box; width: 1; height: 1; depth: 1');
      childEl.setAttribute('position', '2 0 0');
      el.appendChild(childEl);
      once(el, 'loaded', function () { done(); });
      parentEl.appendChild(el);
    });
  });

  function getCollider (el) {
    el.setAttribute('obb-collider', '');
    el.components['obb-collider'].tick();
    return el.components['obb-collider'].obb;
  }

  test('sizes the collider to fit the children', function () {
    var obb = getCollider(this.el);
    assert.closeTo(obb.halfSize.x, 0.5, 1e-6);
    assert.closeTo(obb.halfSize.y, 0.5, 1e-6);
    assert.closeTo(obb.halfSize.z, 0.5, 1e-6);
  });

  test('centers the collider on children offset from the entity', function () {
    var obb;
    this.el.setAttribute('position', '0 1 0');
    this.el.setAttribute('rotation', '0 90 0');
    obb = getCollider(this.el);
    // The child sits 2 units along the entity's local x axis, which the
    // 90 degree rotation around y turns into world -z.
    assert.closeTo(obb.center.x, 0, 1e-6);
    assert.closeTo(obb.center.y, 1, 1e-6);
    assert.closeTo(obb.center.z, -2, 1e-6);
  });

  test('centers the collider when the entity is in a rotated, scaled parent', function () {
    var expected = new THREE.Vector3();
    var obb;
    this.parentEl.setAttribute('position', '0 0 -3');
    this.parentEl.setAttribute('rotation', '0 0 90');
    this.parentEl.setAttribute('scale', '2 2 2');
    this.el.setAttribute('position', '0 1 0');
    obb = getCollider(this.el);
    this.el.object3D.updateMatrixWorld(true);
    new THREE.Box3().setFromObject(this.childEl.object3D).getCenter(expected);
    assert.closeTo(obb.center.x, expected.x, 1e-6);
    assert.closeTo(obb.center.y, expected.y, 1e-6);
    assert.closeTo(obb.center.z, expected.z, 1e-6);
    assert.closeTo(obb.halfSize.x, 1, 1e-6);
  });
});
