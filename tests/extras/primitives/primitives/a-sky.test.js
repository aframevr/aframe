/* global assert, suite, test, setup */
import * as helpers from '../../../helpers.js';

suite('a-sky', function () {
  setup(function (done) {
    var parentEl = helpers.entityFactory();
    var skyEl = this.el = document.createElement('a-sky');
    parentEl.addEventListener('loaded', function () {
      parentEl.sceneEl.appendChild(skyEl);
    });
    skyEl.addEventListener('loaded', function () {
      done();
    });
  });

  test('can set theta-length', function (done) {
    this.el.setAttribute('theta-length', 90);
    setTimeout(() => {
      assert.equal(this.el.getAttribute('geometry').thetaLength, 90);
      done();
    });
  });

  test('can set radius', function (done) {
    this.el.setAttribute('radius', 30);
    setTimeout(() => {
      assert.equal(this.el.getAttribute('geometry').radius, 30);
      done();
    });
  });
});

suite('a-sky material default components', function () {
  test('keeps material defaults when setting src via createElement and setAttribute', function (done) {
    helpers.elFactory().then(function (entityEl) {
      var skyEl = document.createElement('a-sky');
      skyEl.setAttribute('material', {src: 'sky.webp'});
      skyEl.addEventListener('loaded', function () {
        var material = skyEl.getAttribute('material');
        assert.equal(material.side, 'back');
        assert.equal(material.shader, 'flat');
        assert.equal(material.minFilter, 'linear');
        assert.equal(material.src, 'sky.webp');
        done();
      });
      entityEl.sceneEl.appendChild(skyEl);
    });
  });

  test('keeps material defaults after recycled sky materials dirty the pool', function (done) {
    // Two entities carry a sky-shaped material
    // (color/shader/side/minFilter), then removeAttribute('material') recycles both
    // attrValue objects into objectPools['material']. A subsequent a-sky created via
    // createElement + setAttribute pulls a recycled attrValue (keys present, valued
    // undefined) and used to lose its primitive defaults (side: back -> front).
    // Two recycled materials are required: the first recycled attrValue is consumed
    // before the a-sky's attrValue is allocated.
    var skyMaterial = 'color: #FFF; shader: flat; side: back; minFilter: linear';
    helpers.elFactory().then(function (entityEl) {
      var sceneEl = entityEl.sceneEl;
      var leftEye = document.createElement('a-entity');
      leftEye.setAttribute('geometry', 'primitive: sphere; radius: 198');
      leftEye.setAttribute('material', skyMaterial);
      var rightEye = document.createElement('a-entity');
      rightEye.setAttribute('geometry', 'primitive: sphere; radius: 198');
      rightEye.setAttribute('material', skyMaterial);

      var loaded = 0;
      function onEyeLoaded () {
        if (++loaded < 2) { return; }
        // Recycle both {color, shader, side, minFilter} attrValues into the pool.
        leftEye.removeAttribute('material');
        rightEye.removeAttribute('material');
        // a-sky's material attrValue is now pulled from the dirtied pool.
        var skyEl = document.createElement('a-sky');
        skyEl.setAttribute('material', 'src: sky.webp');
        skyEl.addEventListener('loaded', function () {
          try {
            var material = skyEl.getAttribute('material');
            assert.equal(material.src, 'sky.webp');
            assert.equal(material.side, 'back');
            assert.equal(material.shader, 'flat');
            assert.equal(material.minFilter, 'linear');
            done();
          } catch (e) { done(e); }
        });
        sceneEl.appendChild(skyEl);
      }
      leftEye.addEventListener('loaded', onEyeLoaded);
      rightEye.addEventListener('loaded', onEyeLoaded);
      sceneEl.appendChild(leftEye);
      sceneEl.appendChild(rightEye);
    });
  });
});
