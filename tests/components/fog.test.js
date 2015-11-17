/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers.js').entityFactory;

suite('fog', function () {
  'use strict';

  setup(function (done) {
    var entityEl = this.entityEl = entityFactory();
    var el = this.el = this.entityEl.parentNode;
    el.setAttribute('fog', '');
    entityEl.addEventListener('loaded', function () {
      done();
    });
  });

  test('does not set fog for entities', function (done) {
    var entityEl = this.entityEl;
    entityEl.setAttribute('fog', '');
    process.nextTick(function () {
      assert.notOk(entityEl.object3D.fog);
      done();
    });
  });

  suite('update', function () {
    test('creates fog', function () {
      assert.ok(this.el.object3D.fog);
    });

    test('updates fog', function (done) {
      var el = this.el;
      el.setAttribute('fog', 'color: #F0F');
      process.nextTick(function () {
        assert.shallowDeepEqual(el.object3D.fog.color, {r: 1, g: 0, b: 1});
        done();
      });
    });

    test('does not recreate fog when updating', function (done) {
      var el = this.el;
      var uuid = el.object3D.fog.uuid;
      el.setAttribute('fog', 'color: #F0F');
      process.nextTick(function () {
        assert.equal(el.object3D.fog.uuid, uuid);
        done();
      });
    });

    test('can update fog type', function (done) {
      var el = this.el;
      el.setAttribute('fog', 'type: exponential; density: 0.25');
      process.nextTick(function () {
        el.setAttribute('fog', 'density: 0.25');
        setTimeout(function () {
          assert.notOk('density' in el.object3D.fog);
          assert.ok('near' in el.object3D.fog);
          done();
        });
      });
    });

    test('can remove and add linear fog', function (done) {
      var el = this.el;
      el.removeAttribute('fog');
      setTimeout(function () {
        el.setAttribute('fog');
        process.nextTick(function () {
          assert.isAbove(el.object3D.fog.far, 0);
          done();
        });
      });
    });
  });

  suite('remove', function () {
    test('removes fog when detaching fog', function (done) {
      var el = this.el;
      el.removeAttribute('fog');
      process.nextTick(function () {
        assert.equal(el.object3D.fog.far, 0);
        assert.equal(el.object3D.fog.near, 0);
        done();
      });
    });

    test('removes exp. fog when detaching fog', function (done) {
      var el = this.el;
      el.setAttribute('fog', 'type: exponential');
      el.removeAttribute('fog');
      process.nextTick(function () {
        assert.equal(el.object3D.fog.density, 0);
        done();
      });
    });
  });
});
