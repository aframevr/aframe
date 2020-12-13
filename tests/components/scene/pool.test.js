/* global assert, process, setup, suite, test */
let helpers = require('../../helpers');

suite('pool', function () {
  setup(function (done) {
    let el = helpers.entityFactory();
    let sceneEl = this.sceneEl = el.parentNode;
    sceneEl.setAttribute('pool', 'mixin: test; size: 1');
    helpers.mixinFactory('test', {material: 'color: red'}, sceneEl);
    if (sceneEl.hasLoaded) { done(); return; }
    sceneEl.addEventListener('loaded', function () { done(); });
  });

  test('pool is initialized', function (done) {
    let sceneEl = this.sceneEl;
    let poolComponent = sceneEl.components.pool;
    assert.equal(poolComponent.availableEls.length, 1);
    assert.equal(poolComponent.usedEls.length, 0);
    setTimeout(() => {
      assert.equal(sceneEl.querySelectorAll('a-entity[material]').length, 1);
      done();
    });
  });

  test('can specify container', function (done) {
    let container;
    let sceneEl = this.sceneEl;
    let poolComponent = sceneEl.components.pool;

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
      let sceneEl = this.sceneEl;
      let poolComponent = sceneEl.components.pool;
      let el = poolComponent.requestEntity();
      el.addEventListener('loaded', function () {
        assert.ok(el);
        assert.equal(el.getAttribute('material').color, 'red');
      });
    });

    test('get undefined if pool is empty', function () {
      let sceneEl = this.sceneEl;
      let poolComponent = sceneEl.components.pool;
      let el;
      el = poolComponent.requestEntity();
      assert.ok(el);
      el = poolComponent.requestEntity();
      assert.notOk(el);
    });
  });

  suite('returnEntity', function () {
    test('can return an entity to the pool', function () {
      let sceneEl = this.sceneEl;
      let poolComponent = sceneEl.components.pool;
      let el = poolComponent.requestEntity();
      assert.equal(poolComponent.availableEls.length, 0);
      poolComponent.returnEntity(el);
      assert.equal(poolComponent.availableEls.length, 1);
    });

    test('cannot return an entity that did not belong to the pool', function () {
      let sceneEl = this.sceneEl;
      let poolComponent = sceneEl.components.pool;
      let el = poolComponent.requestEntity();
      let badEl = document.createElement('a-entity');
      assert.equal(poolComponent.availableEls.length, 0);
      poolComponent.returnEntity(badEl);
      assert.equal(poolComponent.availableEls.length, 0);
      poolComponent.returnEntity(el);
      assert.equal(poolComponent.availableEls.length, 1);
    });

    test('return an entity and makes the pool grow if dynamic', function () {
      let sceneEl = this.sceneEl;
      let poolComponent = sceneEl.components.pool;
      poolComponent.requestEntity();
      sceneEl.setAttribute('pool', 'dynamic', true);
      assert.equal(poolComponent.availableEls.length, 0);
      assert.equal(poolComponent.usedEls.length, 1);
      poolComponent.requestEntity();
      assert.equal(poolComponent.availableEls.length, 0);
      assert.equal(poolComponent.usedEls.length, 2);
    });
  });

  suite('wrapPlay', function () {
    test('cannot play an entity that is not in use', function () {
      let sceneEl = this.sceneEl;
      let poolComponent = sceneEl.components.pool;
      let el = poolComponent.requestEntity();
      poolComponent.returnEntity(el);
      el.play();
      assert.equal(el.isPlaying, false);
    });
  });
});
