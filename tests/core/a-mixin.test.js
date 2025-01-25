/* global assert, setup, suite, test */
import * as helpers from '../helpers.js';
import { components, registerComponent } from 'core/component.js';

suite('a-mixin', function () {
  var assetsEl;
  var el;

  setup(function (done) {
    el = helpers.entityFactory();
    var self = this;

    el.addEventListener('loaded', function () {
      var sceneEl = self.sceneEl = el.sceneEl;
      assetsEl = sceneEl.querySelector('a-assets');
      done();
    });
  });

  test('applies to already loaded entity', function (done) {
    var mixinEl = document.createElement('a-mixin');
    el.setAttribute('mixin', 'ring');

    mixinEl.setAttribute('id', 'ring');
    mixinEl.setAttribute('geometry', 'primitive: ring');
    assetsEl.appendChild(mixinEl);

    mixinEl.addEventListener('loaded', function () {
      assert.equal(el.getAttribute('geometry').primitive, 'ring');
      mixinEl.setAttribute('geometry', 'primitive: circle');
      setTimeout(function () {
        assert.equal(el.getAttribute('geometry').primitive, 'circle');
        done();
      });
    });
  });

  test('applies to already loaded entity with component', function (done) {
    var mixinEl = document.createElement('a-mixin');
    el.setAttribute('mixin', 'ring');
    el.setAttribute('geometry', 'buffer: false');
    mixinEl.setAttribute('id', 'ring');
    mixinEl.setAttribute('geometry', 'primitive: ring');
    assetsEl.appendChild(mixinEl);

    mixinEl.addEventListener('loaded', function () {
      var geometry = el.getAttribute('geometry');
      assert.equal(geometry.buffer, false);
      assert.equal(geometry.primitive, 'ring');
      done();
    });
  });

  suite('mixin composition', function () {
    test('allows mixin to define mixin post-attach', done => {
      var mixinEl1;
      var mixinEl2;

      el.setAttribute('mixin', 'bar');

      mixinEl1 = document.createElement('a-mixin');
      mixinEl1.setAttribute('id', 'foo');
      assetsEl.appendChild(mixinEl1);

      setTimeout(() => {
        mixinEl2 = document.createElement('a-mixin');
        mixinEl2.setAttribute('id', 'bar');
        mixinEl2.setAttribute('mixin', 'foo');
        mixinEl2.setAttribute('geometry', 'primitive: sphere');
        assetsEl.appendChild(mixinEl2);

        setTimeout(() => {
          assert.equal(el.mixinEls.length, 2);
          assert.equal(el.getAttribute('mixin'), 'foo bar');
          assert.ok(el.mixinEls.indexOf(mixinEl1) !== -1);
          assert.ok(el.mixinEls.indexOf(mixinEl2) !== -1);
          assert.equal(el.getAttribute('geometry').primitive, 'sphere');
          done();
        });
      });
    });

    test('allows mixin to be removed during component init', function (done) {
      var mixinEl = document.createElement('a-mixin');
      var testEl = document.createElement('a-entity');
      mixinEl.setAttribute('id', 'red');
      mixinEl.setAttribute('material', 'color: red');
      assetsEl.appendChild(mixinEl);

      registerComponent('delete-mixin', {
        init: function () {
          this.el.removeAttribute('mixin');
        }
      });

      testEl.setAttribute('mixin', 'red');
      testEl.setAttribute('delete-mixin', '');
      testEl.addEventListener('loaded', function () {
        assert.equal(testEl.getAttribute('mixin'), null);
        assert.equal(testEl.getAttribute('material'), null);
        done();
      });
      el.sceneEl.appendChild(testEl);
    });

    test('allows mixin to define mixin pre-attach', done => {
      var mixinEl1;
      var mixinEl2;

      mixinEl1 = document.createElement('a-mixin');
      mixinEl1.setAttribute('id', 'foo');
      assetsEl.appendChild(mixinEl1);

      setTimeout(() => {
        mixinEl2 = document.createElement('a-mixin');
        mixinEl2.setAttribute('id', 'bar');
        mixinEl2.setAttribute('mixin', 'foo');
        mixinEl2.setAttribute('geometry', 'primitive: sphere');
        assetsEl.appendChild(mixinEl2);

        setTimeout(() => {
          el.setAttribute('mixin', 'bar');

          setTimeout(() => {
            assert.equal(el.mixinEls.length, 2);
            assert.equal(el.getAttribute('mixin'), 'foo bar');
            assert.ok(el.mixinEls.indexOf(mixinEl1) !== -1);
            assert.ok(el.mixinEls.indexOf(mixinEl2) !== -1);
            assert.equal(el.getAttribute('geometry').primitive, 'sphere');
            done();
          });
        });
      });
    });

    test('compositing mixin components override composited mixin components', done => {
      var mixinEl1;
      var mixinEl2;

      el.setAttribute('mixin', 'bar');

      mixinEl1 = document.createElement('a-mixin');
      mixinEl1.setAttribute('id', 'foo');
      mixinEl1.setAttribute('geometry', 'primitive: torus');
      mixinEl1.setAttribute('material', 'color: blue');
      assetsEl.appendChild(mixinEl1);

      setTimeout(() => {
        mixinEl2 = document.createElement('a-mixin');
        mixinEl2.setAttribute('id', 'bar');
        mixinEl2.setAttribute('mixin', 'foo');
        mixinEl2.setAttribute('geometry', 'primitive: sphere');
        assetsEl.appendChild(mixinEl2);

        setTimeout(() => {
          assert.equal(el.mixinEls.length, 2);
          assert.ok(el.mixinEls.indexOf(mixinEl1) !== -1);
          assert.ok(el.mixinEls.indexOf(mixinEl2) !== -1);

          assert.equal(el.getAttribute('geometry').primitive, 'sphere');
          assert.equal(el.getAttribute('material').color, 'blue');
          done();
        });
      });
    });

    test('composites multiple levels of nested mixins', done => {
      var mixinEl1;
      var mixinEl2;
      var mixinEl3;
      var mixinEl4;
      var mixinEl5;

      mixinEl1 = document.createElement('a-mixin');
      mixinEl1.setAttribute('id', 'foo');
      mixinEl1.setAttribute('mixin', 'bar');
      assetsEl.appendChild(mixinEl1);

      setTimeout(() => {
        mixinEl2 = document.createElement('a-mixin');
        mixinEl2.setAttribute('id', 'bar');
        mixinEl2.setAttribute('mixin', 'qaz qux');
        assetsEl.appendChild(mixinEl2);

        setTimeout(() => {
          mixinEl3 = document.createElement('a-mixin');
          mixinEl3.setAttribute('id', 'qaz');
          assetsEl.appendChild(mixinEl3);

          setTimeout(() => {
            mixinEl4 = document.createElement('a-mixin');
            mixinEl4.setAttribute('id', 'qux');
            assetsEl.appendChild(mixinEl4);

            setTimeout(() => {
              mixinEl5 = document.createElement('a-mixin');
              mixinEl5.setAttribute('id', 'baz');
              assetsEl.appendChild(mixinEl5);

              setTimeout(() => {
                el.setAttribute('mixin', 'baz foo');

                setTimeout(() => {
                  assert.equal(el.getAttribute('mixin'), 'baz qaz qux bar foo');
                  assert.equal(el.mixinEls[0], mixinEl5);
                  assert.equal(el.mixinEls[1], mixinEl3);
                  assert.equal(el.mixinEls[2], mixinEl4);
                  assert.equal(el.mixinEls[3], mixinEl2);
                  assert.equal(el.mixinEls[4], mixinEl1);
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  suite('parseComponentAttrValue', function () {
    var mixinEl;

    setup(function () {
      components.dummy = undefined;
      mixinEl = document.createElement('a-mixin');
    });

    test('parses single value component', function () {
      registerComponent('dummy', {
        schema: {default: '0 0 1', type: 'vec3'}
      });
      var componentObj = mixinEl.parseComponentAttrValue(components.dummy, '1 2 3');
      assert.deepEqual(componentObj, {x: 1, y: 2, z: 3});
    });

    test('parses component using the style parser for a complex schema', function () {
      registerComponent('dummy', {
        schema: {
          position: {type: 'vec3', default: '0 0 1'},
          color: {default: 'red'}
        }
      });
      var componentObj = mixinEl.parseComponentAttrValue(components.dummy, {position: '0 1 0', color: 'red'});
      assert.deepEqual(componentObj, {position: '0 1 0', color: 'red'});
    });

    test('does not parse properties that parse to another string', function () {
      registerComponent('dummy', {
        schema: {
          url: {type: 'src', default: ''}
        }
      });
      var componentObj = mixinEl.parseComponentAttrValue(components.dummy, {url: 'url(www.mozilla.com)'});
      assert.equal(componentObj.url, 'url(www.mozilla.com)');
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

    test('caches multiple component attributes', function () {
      var mixinEl = document.createElement('a-mixin');
      mixinEl.setAttribute('sound__test', 'src: url(mysoundfile.mp3)');
      mixinEl.cacheAttributes();
      assert.shallowDeepEqual(mixinEl.componentCache.sound__test, {src: 'url(mysoundfile.mp3)'});
    });
  });
});
