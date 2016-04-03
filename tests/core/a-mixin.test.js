/* global assert, suite, test */

suite('a-mixin', function () {
  suite('cacheAttributes', function () {
    test('cache component attributes', function () {
      var mixinEl = document.createElement('a-mixin');
      mixinEl.setAttribute('material', 'color: red');
      mixinEl.cacheAttributes();
      assert.shallowDeepEqual(mixinEl.componentAttrCache.material, { color: 'red' });
    });

    test('does not cache non component attributes', function () {
      var mixinEl = document.createElement('a-mixin');
      mixinEl.setAttribute('test', 'src: url(www.mozilla.com)');
      mixinEl.cacheAttributes();
      assert.equal(mixinEl.componentAttrCache.test, undefined);
    });
  });
});

