/* global assert, setup, suite, teardown, test */
var utils = require('utils/');

suite('stats', function () {
  var originalGetUrlParameter = utils.getUrlParameter;

  setup(function (done) {
    var el = this.sceneEl = document.createElement('a-scene');
    el.setAttribute('stats', '');
    document.body.appendChild(el);

    el.addEventListener('loaded', function () { done(); });

    utils.getUrlParameter = function () { return 'false'; };
  });

  teardown(function () {
    var el = this.sceneEl;
    el.parentNode.removeChild(el);

    utils.getUrlParameter = originalGetUrlParameter;
  });

  test('Stats are not created when query string "stats" is "false"', function () {
    assert.equal(document.querySelector('.rs-base'), null);
    assert.equal(this.sceneEl.components.stats.statsEl, undefined);
    assert.equal(this.sceneEl.components.stats.update(), undefined); // Neither show or hide
  });

  suite('stats=true', function () {
    var originalGetUrlParameter = utils.getUrlParameter;

    setup(function (done) {
      var el = this.sceneEl = document.createElement('a-scene');
      el.setAttribute('stats', '');
      document.body.appendChild(el);

      el.addEventListener('loaded', function () { done(); });

      utils.getUrlParameter = function () { return 'true'; };
    });

    teardown(function () {
      var el = this.sceneEl;
      el.parentNode.removeChild(el);

      utils.getUrlParameter = originalGetUrlParameter;
    });

    test('Stats are created when query string "stats" is "true"', function () {
      assert.equal(document.querySelector('.rs-container').parentNode, this.sceneEl.components.stats.statsEl);
      assert.ok(this.sceneEl.components.stats.statsEl);
    });

    test('Stats DOM element is not visible', function () {
      assert.equal(this.sceneEl.components.stats.statsEl.style.display, 'none');
    });

    test('Stats A-Frame element is attached', function () {
      setTimeout(function () { assert.ok(this.sceneEl.components.stats.statspanel); }, 0);
    });
  });
});
