/* global assert, process, setup, suite, test */
let entityFactory = require('../../helpers').entityFactory;

suite('fog', function () {
  setup(function (done) {
    this.entityEl = entityFactory();
    let el = this.el = this.entityEl.parentNode;
    let self = this;

    el.addEventListener('loaded', function () {
      self.updateMaterialsSpy = self.sinon.spy(el.systems.material, 'updateMaterials');
      // Stub scene load to avoid WebGL code.
      el.hasLoaded = true;
      el.setAttribute('fog', '');

      done();
    });
  });

  test('does not set fog for entities', function () {
    let entityEl = this.entityEl;
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
      let el = this.el;
      el.setAttribute('fog', 'color: #F0F');
      assert.shallowDeepEqual(el.object3D.fog.color, {r: 1, g: 0, b: 1});
    });

    test('does not recreate fog when updating', function () {
      let el = this.el;
      let uuid = el.object3D.fog.uuid;
      el.setAttribute('fog', 'color: #F0F');
      assert.equal(el.object3D.fog.uuid, uuid);
    });

    test('can update fog type', function () {
      let el = this.el;
      assert.equal(el.getAttribute('fog').type, 'linear');
      assert.notOk('density' in el.object3D.fog);
      assert.ok('near' in el.object3D.fog);
      el.setAttribute('fog', 'type: exponential; density: 0.25');
      assert.equal(el.getAttribute('fog').type, 'exponential');
      assert.ok('density' in el.object3D.fog);
      assert.notOk('near' in el.object3D.fog);
    });

    test('can remove and add linear fog', function () {
      let el = this.el;
      el.removeAttribute('fog');
      el.setAttribute('fog', '');
    });
  });

  suite('remove', function () {
    test('removes fog when detaching fog', function () {
      let el = this.el;
      el.removeAttribute('fog');
      assert.equal(el.object3D.fog.far, 0);
      assert.equal(el.object3D.fog.near, 0.1);
    });

    test('removes exp. fog when detaching fog', function () {
      let el = this.el;
      el.setAttribute('fog', 'type: exponential');
      el.removeAttribute('fog');
      assert.equal(el.object3D.fog.far, 0);
      assert.equal(el.object3D.fog.near, 0.1);
    });
  });
});
