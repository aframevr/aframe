/* global assert, process, setup, suite, test */

suite('pool', function () {
  setup(function (done) {
    var el = this.sceneEl = document.createElement('a-scene');
    var assetsEl = document.createElement('a-assets');
    var mixinEl = document.createElement('a-mixin');
    mixinEl.id = 'test';
    mixinEl.setAttribute('material', 'color: red');
    assetsEl.appendChild(mixinEl);
    el.appendChild(assetsEl);
    // Set a fake URL so the inspector doesn't interfere with other tests
    el.setAttribute('pool', 'mixin: test; size: 1');
    el.addEventListener('loaded', function () { done(); });
    document.body.appendChild(el);
  });

  test('pool is initialized', function () {
    var sceneEl = this.sceneEl;
    var poolComponent = sceneEl.components.pool;
    assert.equal(poolComponent.poolEls.length, 1);
    assert.equal(poolComponent.pooledEls.length, 0);
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
      assert.equal(poolComponent.poolEls.length, 0);
      poolComponent.returnEntity(el);
      assert.equal(poolComponent.poolEls.length, 1);
    });

    test('cannot return an entity that did not belong to the pool', function () {
      var sceneEl = this.sceneEl;
      var poolComponent = sceneEl.components.pool;
      var el = poolComponent.requestEntity();
      var badEl = document.createElement('a-entity');
      assert.equal(poolComponent.poolEls.length, 0);
      poolComponent.returnEntity(badEl);
      assert.equal(poolComponent.poolEls.length, 0);
      poolComponent.returnEntity(el);
      assert.equal(poolComponent.poolEls.length, 1);
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
