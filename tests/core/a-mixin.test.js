/* global assert, setup, suite, test */
var helpers = require('../helpers');

suite('a-mixin', function () {
  setup(function (done) {
    var el = this.el = helpers.entityFactory();
    var self = this;

    el.addEventListener('loaded', function () {
      var sceneEl = self.sceneEl = el.sceneEl;
      self.assetsEl = sceneEl.querySelector('a-assets');
      done();
    });
  });

  test('applies to already loaded entity', function (done) {
    var el = this.el;
    var mixinEl = document.createElement('a-mixin');
    el.setAttribute('mixin', 'ring');

    mixinEl.setAttribute('id', 'ring');
    mixinEl.setAttribute('geometry', 'primitive: ring');
    this.assetsEl.appendChild(mixinEl);

    mixinEl.addEventListener('loaded', function () {
      assert.equal(el.getComputedAttribute('geometry').primitive, 'ring');
      mixinEl.setAttribute('geometry', 'primitive: circle');
      process.nextTick(function () {
        assert.equal(el.getComputedAttribute('geometry').primitive, 'circle');
        done();
      });
    });
  });

  test('applies to already loaded entity with component', function (done) {
    var el = this.el;
    var mixinEl = document.createElement('a-mixin');
    el.setAttribute('mixin', 'ring');
    el.setAttribute('geometry', 'buffer: false');

    mixinEl.setAttribute('id', 'ring');
    mixinEl.setAttribute('geometry', 'primitive: ring');
    this.assetsEl.appendChild(mixinEl);

    mixinEl.addEventListener('loaded', function () {
      var geometry = el.getComputedAttribute('geometry');
      assert.equal(geometry.buffer, false);
      assert.equal(geometry.primitive, 'ring');
      done();
    });
  });
});

suite('a-mixin (detached)', function () {
  suite('cacheAttributes', function () {
    test('caches component attributes', function () {
      var mixinEl = document.createElement('a-mixin');
      mixinEl.setAttribute('material', 'color: red');
      mixinEl.cacheAttributes();
      assert.shallowDeepEqual(mixinEl.componentCache.material, {color: 'red'});
    });

    test('does not cache non-component attributes', function () {
      var mixinEl = document.createElement('a-mixin');
      mixinEl.setAttribute('test', 'src: url(www.mozilla.com)');
      mixinEl.cacheAttributes();
      assert.equal(mixinEl.componentCache.test, undefined);
    });
  });
});

