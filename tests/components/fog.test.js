/* global assert, process, setup, suite, test */
var AScene = require('index').AScene;
var entityFactory = require('../helpers').entityFactory;

suite('fog', function () {
  'use strict';

  setup(function () {
    var el;
    this.entityEl = entityFactory();
    el = this.el = this.entityEl.parentNode;
    this.updateMaterialsSpy = this.sinon.spy(AScene.prototype, 'updateMaterials');

    // We force loading of the scene since the logic
    // that fires the event is in attachedCallback
    // which is stubbed to avoid running any WebGL code
    el.pendingElements = 0;
    el.load();
    el.setAttribute('fog', '');
  });

  test('does not set fog for entities', function () {
    var entityEl = this.entityEl;
    entityEl.setAttribute('fog', '');
    assert.notOk(entityEl.object3D.fog);
  });

  suite('update', function () {
    test('creates fog', function () {
      assert.ok(this.el.object3D.fog);
    });

    test('triggers material update when adding fog', function () {
      assert.ok(this.updateMaterialsSpy.called);
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
      el.setAttribute('fog', 'type: exponential; density: 0.25');
      el.setAttribute('fog', 'density: 0.25');
      assert.notOk('density' in el.object3D.fog);
      assert.ok('near' in el.object3D.fog);
    });

    test('can remove and add linear fog', function () {
      var el = this.el;
      el.removeAttribute('fog');
      el.setAttribute('fog');
    });
  });

  suite('remove', function () {
    test('removes fog when detaching fog', function () {
      var el = this.el;
      el.removeAttribute('fog');
      assert.equal(el.object3D.fog.far, 0);
      assert.equal(el.object3D.fog.near, 0);
    });

    test('removes exp. fog when detaching fog', function () {
      var el = this.el;
      el.setAttribute('fog', 'type: exponential');
      el.removeAttribute('fog');
      assert.equal(el.object3D.fog.density, 0);
    });
  });
});
