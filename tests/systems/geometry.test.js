/* global assert, setup, suite, teardown, test */
import { entityFactory } from '../helpers.js';

suite('geometry system', function () {
  setup(function (done) {
    var el = entityFactory();
    var self = this;
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
      var data = {primitive: 'box'};
      var system = this.system;
      var hash = system.hash(data);

      assert.notOk(system.cache[hash]);
      system.getOrCreateGeometry(data);
      assert.ok(system.cache[hash]);
    });

    test('does not hash on cache if skipCache', function () {
      var data = {primitive: 'box', skipCache: true};
      var system = this.system;
      var hash = system.hash(data);
      system.getOrCreateGeometry({primitive: 'box'});
      assert.notOk(system.cache[hash]);
    });

    test('caches identical geometries', function () {
      var data = {primitive: 'box', width: 5};
      var geometry1;
      var geometry2;
      var system = this.system;
      var hash = system.hash(data);

      geometry1 = system.getOrCreateGeometry(data);
      assert.ok(geometry1);

      geometry2 = system.getOrCreateGeometry(data);
      assert.ok(geometry2);

      assert.equal(geometry1, geometry2);
      assert.equal(system.cacheCount[hash], 2);
    });

    test('preserves original metadata on BufferGeometry', function () {
      var data = {primitive: 'box', width: 5, buffer: true};
      var geometry = this.system.getOrCreateGeometry(data);
      assert.equal(geometry.type, 'BoxGeometry');
      assert.equal(geometry.parameters.width, 5);
    });
  });

  suite('unuseGeometry', function () {
    teardown(function () {
      this.system.clearCache();
    });

    test('disposes geometry if no longer used', function () {
      var data = {primitive: 'box'};
      var system = this.system;
      var hash = system.hash(data);
      var sinon = this.sinon;

      var geometry = system.getOrCreateGeometry(data);
      var disposeSpy = sinon.spy(geometry, 'dispose');
      system.unuseGeometry(data);

      assert.ok(disposeSpy.called);
      assert.notOk(system.cache[hash]);
      assert.notOk(system.cacheCount[hash]);
    });

    test('does not dispose geometry if still used', function () {
      var data = {primitive: 'box'};
      var system = this.system;
      var hash = system.hash(data);
      var sinon = this.sinon;

      var geometry = system.getOrCreateGeometry(data);
      var disposeSpy = sinon.spy(geometry, 'dispose');

      system.getOrCreateGeometry(data);
      system.unuseGeometry(data);
      assert.notOk(disposeSpy.called);
      assert.ok(system.cache[hash]);
      assert.equal(system.cacheCount[hash], 1);
    });
  });
});
