/* global assert, process, setup, suite, teardown, test */
let entityFactory = require('../helpers').entityFactory;

suite('geometry system', function () {
  setup(function (done) {
    let el = entityFactory();
    let self = this;
    el.addEventListener('loaded', function () {
      self.system = el.sceneEl.systems.geometry;
      done();
    });
  });

  suite('getOrCreateGeometry', function () {
    teardown(function () {
      this.system.clearCache();
    });

    test('sets hash on cache', function () {
      let data = {primitive: 'box'};
      let system = this.system;
      let hash = system.hash(data);

      assert.notOk(system.cache[hash]);
      system.getOrCreateGeometry(data);
      assert.ok(system.cache[hash]);
    });

    test('does not hash on cache if skipCache', function () {
      let data = {primitive: 'box', skipCache: true};
      let system = this.system;
      let hash = system.hash(data);
      system.getOrCreateGeometry({primitive: 'box'});
      assert.notOk(system.cache[hash]);
    });

    test('caches identical geometries', function () {
      let data = {primitive: 'box', width: 5};
      let geometry1;
      let geometry2;
      let system = this.system;
      let hash = system.hash(data);

      geometry1 = system.getOrCreateGeometry(data);
      assert.ok(geometry1);

      geometry2 = system.getOrCreateGeometry(data);
      assert.ok(geometry2);

      assert.equal(geometry1, geometry2);
      assert.equal(system.cacheCount[hash], 2);
    });

    test('preserves original metadata on BufferGeometry', function () {
      let data = {primitive: 'box', width: 5, buffer: true};
      let geometry = this.system.getOrCreateGeometry(data);
      assert.equal(geometry.metadata.type, 'BoxGeometry');
      assert.equal(geometry.metadata.parameters.width, 5);
    });
  });

  suite('unuseGeometry', function () {
    teardown(function () {
      this.system.clearCache();
    });

    test('disposes geometry if no longer used', function () {
      let data = {primitive: 'box'};
      let system = this.system;
      let hash = system.hash(data);
      let sinon = this.sinon;

      let geometry = system.getOrCreateGeometry(data);
      let disposeSpy = sinon.spy(geometry, 'dispose');
      system.unuseGeometry(data);

      assert.ok(disposeSpy.called);
      assert.notOk(system.cache[hash]);
      assert.notOk(system.cacheCount[hash]);
    });

    test('does not dispose geometry if still used', function () {
      let data = {primitive: 'box'};
      let system = this.system;
      let hash = system.hash(data);
      let sinon = this.sinon;

      let geometry = system.getOrCreateGeometry(data);
      let disposeSpy = sinon.spy(geometry, 'dispose');

      system.getOrCreateGeometry(data);
      system.unuseGeometry(data);
      assert.notOk(disposeSpy.called);
      assert.ok(system.cache[hash]);
      assert.equal(system.cacheCount[hash], 1);
    });
  });
});
