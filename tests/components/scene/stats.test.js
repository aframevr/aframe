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
});
