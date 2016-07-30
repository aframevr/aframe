/* global assert, process, setup, suite, test */
var entityFactory = require('../../helpers').entityFactory;

suite('fog', function () {
  setup(function (done) {
    this.entityEl = entityFactory();
    var el = this.el = this.entityEl.parentNode;
    var self = this;

    el.addEventListener('loaded', function () {
      self.updateMaterialsSpy = self.sinon.spy(el.systems.material, 'updateMaterials');

      // Stub scene load to avoid WebGL code.
      el.hasLoaded = true;
      el.setAttribute('fog', '');

      done();
    });
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
      el.setAttribute('fog', '');
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
