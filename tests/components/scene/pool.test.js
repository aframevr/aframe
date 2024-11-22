/* global assert, process, setup, suite, test */
var helpers = require('../../helpers');

suite('pool', function () {
  setup(function (done) {
    var el = helpers.entityFactory();
    var sceneEl = this.sceneEl = el.parentNode;
    sceneEl.setAttribute('pool', 'mixin: test; size: 1');
    helpers.mixinFactory('test', {material: 'color: red'}, sceneEl);
    if (sceneEl.hasLoaded) { done(); return; }
    sceneEl.addEventListener('loaded', function () { done(); });
  });

  test('pool is initialized', function (done) {
    var sceneEl = this.sceneEl;
    var poolComponent = sceneEl.components.pool;
    assert.equal(poolComponent.availableEls.length, 1);
    assert.equal(poolComponent.usedEls.length, 0);
    setTimeout(() => {
      assert.equal(sceneEl.querySelectorAll('a-entity[material]').length, 1);
      done();
    });
  });

  test('can specify container', function (done) {
    var container;
    var sceneEl = this.sceneEl;
    var poolComponent = sceneEl.components.pool;

    container = document.createElement('a-entity');
    container.setAttribute('id', 'foo');
    sceneEl.appendChild(container);

    setTimeout(() => {
      sceneEl.setAttribute('pool__foo', 'mixin: test; size: 1; container: #foo');
      setTimeout(() => {
        assert.equal(poolComponent.availableEls.length, 1);
        assert.equal(poolComponent.usedEls.length, 0);
        assert.equal(container.querySelectorAll('[material]').length, 1);
        done();
      });
    });
  });

  suite('requestEntity', function () {
    test('can request an available entity', function () {
      var sceneEl = this.sceneEl;
      var poolComponent = sceneEl.components.pool;
      var el = poolComponent.requestEntity();
      el.addEventListener('loaded', function () {
        assert.ok(el);
        assert.equal(el.getAttribute('material').color, 'red');
      });
    });

    test('get undefined if pool is empty', function () {
      var sceneEl = this.sceneEl;
      var poolComponent = sceneEl.components.pool;
      var el;
      el = poolComponent.requestEntity();
      assert.ok(el);
      el = poolComponent.requestEntity();
      assert.notOk(el);
    });
  });

  suite('returnEntity', function () {
    test('can return an entity to the pool', function () {
      var sceneEl = this.sceneEl;
      var poolComponent = sceneEl.components.pool;
      var el = poolComponent.requestEntity();
      assert.equal(poolComponent.availableEls.length, 0);
      poolComponent.returnEntity(el);
      assert.equal(poolComponent.availableEls.length, 1);
    });

    test('cannot return an entity that did not belong to the pool', function () {
      var sceneEl = this.sceneEl;
      var poolComponent = sceneEl.components.pool;
      var el = poolComponent.requestEntity();
      var badEl = document.createElement('a-entity');
      assert.equal(poolComponent.availableEls.length, 0);
      poolComponent.returnEntity(badEl);
      assert.equal(poolComponent.availableEls.length, 0);
      poolComponent.returnEntity(el);
      assert.equal(poolComponent.availableEls.length, 1);
    });

    test('return an entity and makes the pool grow if dynamic', function () {
      var sceneEl = this.sceneEl;
      var poolComponent = sceneEl.components.pool;
      poolComponent.requestEntity();
      sceneEl.setAttribute('pool', 'dynamic', true);
      assert.equal(poolComponent.availableEls.length, 0);
      assert.equal(poolComponent.usedEls.length, 1);
      poolComponent.requestEntity();
      assert.equal(poolComponent.availableEls.length, 0);
      assert.equal(poolComponent.usedEls.length, 2);
    });
  });

  suite('attachmentToThreeScene', function () {
    test('Pool entity is not initially attached to scene', function () {
      var sceneEl = this.sceneEl;
      var poolComponent = sceneEl.components.pool;
      assert.equal(poolComponent.availableEls[0].object3D.parent, null);
    });

    test('Pool entity is attached to scene when requested, and detached when released', function () {
      var sceneEl = this.sceneEl;
      var poolComponent = sceneEl.components.pool;
      var el = poolComponent.requestEntity();
      assert.equal(el.object3D.parent, sceneEl.object3D);
      poolComponent.returnEntity(el);
      assert.equal(el.object3D.parent, null);
    });

    test('Raycaster is updated when entities are attached to / detached from scene', function (done) {
      var sceneEl = this.sceneEl;
      var rayEl = document.createElement('a-entity');
      rayEl.setAttribute('raycaster', '');
      rayEl.addEventListener('loaded', function () {
        var rayComponent = rayEl.components.raycaster;
        assert.equal(rayComponent.dirty, true);
        rayComponent.tock();
        assert.equal(rayComponent.dirty, false);
        var poolComponent = sceneEl.components.pool;
        var el = poolComponent.requestEntity();
        assert.equal(el.object3D.parent, sceneEl.object3D);
        assert.equal(rayComponent.dirty, true);
        rayComponent.tock();
        assert.equal(rayComponent.dirty, false);
        poolComponent.returnEntity(el);
        assert.equal(el.object3D.parent, null);
        assert.equal(rayComponent.dirty, true);
        rayComponent.tock();
        assert.equal(rayComponent.dirty, false);
        done();
      });
      sceneEl.appendChild(rayEl);
    });
  });

  suite('wrapPlay', function () {
    test('cannot play an entity that is not in use', function () {
      var sceneEl = this.sceneEl;
      var poolComponent = sceneEl.components.pool;
      var el = poolComponent.requestEntity();
      poolComponent.returnEntity(el);
      el.play();
      assert.equal(el.isPlaying, false);
    });
  });
});
