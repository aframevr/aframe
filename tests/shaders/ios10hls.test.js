/* global AFRAME, CustomEvent, assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite.skip('ios10hls', function () {
  setup(function (done) {
    this.el = entityFactory();
    if (this.el.hasLoaded) {
      done();
    } else {
      this.el.addEventListener('loaded', function () { done(); });
    }
  });

  test('iOS HLS video uses appropriate shader', function (done) {
    var el = this.el;
    el.sceneEl.isIOS = true;

    // Set up and verify video element to be treated as HLS.
    var videoEl = document.createElement('video');
    videoEl.type = 'application/x-mpegurl';
    assert.equal(AFRAME.utils.material.isHLS(videoEl.src, videoEl.type), true);

    el.setAttribute('material', {src: videoEl});
    videoEl.dispatchEvent(new CustomEvent('loadeddata'));

    setTimeout(function () {
      assert.equal(el.getAttribute('material').shader, 'ios10hls');
      el.sceneEl.isIOS = false;
      done();
    });
  });
});
