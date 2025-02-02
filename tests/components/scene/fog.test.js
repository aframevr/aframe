/* global assert, setup, suite, test */
import { entityFactory } from '../../helpers.js';

suite('fog', function () {
  setup(function (done) {
    this.entityEl = entityFactory();
    var el = this.el = this.entityEl.parentNode;

    el.addEventListener('loaded', function () {
      // Stub scene load to avoid WebGL code.
      el.hasLoaded = true;
      el.setAttribute('fog', '');

      done();
    });
  });

  test('does not set fog for entities', function () {
    var entityEl = this.entityEl;
    try {
      entityEl.setAttribute('fog', '');
      assert.fail();
    } catch (e) {
      assert.equal(e.message, 'Component `fog` can only be applied to <a-scene>');
    }
    assert.notOk(entityEl.object3D.fog);
    assert.notOk(entityEl.components['fog']);
  });

  suite('update', function () {
    test('creates fog', function () {
      assert.ok(this.el.object3D.fog);
    });

    test('updates fog', function () {
      var el = this.el;
      el.setAttribute('fog', 'color: #F0F');
      assert.shallowDeepEqual(el.object3D.fog.color, {r: 1, g: 0, b: 1});
    });

    test('does not recreate fog when updating', function () {
      var el = this.el;
      var uuid = el.object3D.fog.uuid;
      el.setAttribute('fog', 'color: #F0F');
      assert.equal(el.object3D.fog.uuid, uuid);
    });

    test('can update fog type', function () {
      var el = this.el;
      assert.equal(el.getAttribute('fog').type, 'linear');
      assert.notOk('density' in el.object3D.fog);
      assert.ok('near' in el.object3D.fog);
      el.setAttribute('fog', 'type: exponential; density: 0.25');
      assert.equal(el.getAttribute('fog').type, 'exponential');
      assert.ok('density' in el.object3D.fog);
      assert.notOk('near' in el.object3D.fog);
    });

    test('can remove and add linear fog', function () {
      var el = this.el;
      el.removeAttribute('fog');
      el.setAttribute('fog', '');
    });
  });

  suite('remove', function () {
    test('removes fog when detaching fog', function () {
      var el = this.el;
      el.removeAttribute('fog');
      assert.equal(el.object3D.fog, null);
    });
  });
});
