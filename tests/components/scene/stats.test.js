/* global assert, setup, suite, teardown, test */
suite('stats', function () {
  var originalLocationUrl = window.location.toString();

  setup(function (done) {
    var el = this.sceneEl = document.createElement('a-scene');
    el.setAttribute('stats', '');
    document.body.appendChild(el);

    el.addEventListener('loaded', function () { done(); });

    window.history.replaceState(null, '', originalLocationUrl + '?stats=false');
  });

  teardown(function () {
    var el = this.sceneEl;
    el.parentNode.removeChild(el);

    window.history.replaceState(null, '', originalLocationUrl);
  });

  test('Stats are not created when query string "stats" is "false"', function () {
    assert.equal(document.querySelector('.rs-base'), null);
    assert.equal(this.sceneEl.components.stats.statsEl, undefined);
    assert.equal(this.sceneEl.components.stats.update(), undefined); // Neither show or hide
  });
});
