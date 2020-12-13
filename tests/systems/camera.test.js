/* global assert, process, setup, suite, test, sinon */
let constants = require('constants/');
let entityFactory = require('../helpers').entityFactory;

suite('camera system', function () {
  let sceneEl;

  setup(function (done) {
    let el = this.el = entityFactory();
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('creates default camera if not defined', function (done) {
    // Create scene.
    sceneEl = document.createElement('a-scene');

    sceneEl.addEventListener('loaded', function () {
      assert.ok(sceneEl.camera);
      assert.ok(sceneEl.camera.el.getObject3D('camera'));
      assert.ok(sceneEl.camera.el.hasAttribute(constants.AFRAME_INJECTED));
      assert.ok(sceneEl.camera.el.hasAttribute('look-controls'));
      done();
    });

    document.body.appendChild(sceneEl);
  });

  test('uses defined camera if defined', function (done) {
    let assetsEl;
    let imgEl;  // Image that will never load.
    let cameraEl;
    let sceneEl;

    // Create assets.
    assetsEl = document.createElement('a-assets');
    imgEl = document.createElement('img');
    imgEl.setAttribute('src', 'neverloadlalala5.gif');
    assetsEl.appendChild(imgEl);

    // Create scene.
    sceneEl = document.createElement('a-scene');
    sceneEl.appendChild(assetsEl);

    // Create camera.
    cameraEl = document.createElement('a-entity');
    cameraEl.setAttribute('camera', '');
    sceneEl.appendChild(cameraEl);

    sceneEl.addEventListener('loaded', function () {
      assert.equal(sceneEl.camera.el, cameraEl);
      done();
    });

    document.body.appendChild(sceneEl);

    // Trigger scene load through assets. Camera will be waiting for assets.
    // Add `setTimeout` to mimic asynchrony of asset loading.
    setTimeout(function () { assetsEl.load(); });
  });

  test('uses defined a-camera if defined', function (done) {
    let cameraEl;
    let sceneEl;

    // Create scene.
    sceneEl = document.createElement('a-scene');

    // Create camera.
    cameraEl = document.createElement('a-camera');
    sceneEl.appendChild(cameraEl);

    sceneEl.addEventListener('cameraready', function () {
      assert.ok(cameraEl.getObject3D('camera'));
      assert.equal(sceneEl.camera.el, cameraEl);
      done();
    });

    document.body.appendChild(sceneEl);
  });

  test('does not choose defined spectator camera as initial camera', function (done) {
    let cameraEl;
    let sceneEl;

    // Create scene.
    sceneEl = document.createElement('a-scene');

    // Create camera.
    cameraEl = document.createElement('a-entity');
    cameraEl.setAttribute('camera', 'spectator: true');
    sceneEl.appendChild(cameraEl);

    sceneEl.addEventListener('loaded', function () {
      assert.notEqual(sceneEl.camera.el, cameraEl);
      done();
    });

    document.body.appendChild(sceneEl);
  });

  test('does not choose non-active camera as initial camera', function (done) {
    let cameraEl;
    let sceneEl;

    // Create scene.
    sceneEl = document.createElement('a-scene');

    // Create camera.
    cameraEl = document.createElement('a-entity');
    cameraEl.setAttribute('camera', 'active: false');
    sceneEl.appendChild(cameraEl);

    sceneEl.addEventListener('loaded', function () {
      assert.notEqual(sceneEl.camera.el, cameraEl);
      done();
    });

    document.body.appendChild(sceneEl);
  });

  suite('setActiveCamera', function () {
    test('sets new active camera on scene', function () {
      let el = this.el;
      el.setAttribute('camera', '');
      assert.equal(el.sceneEl.camera, el.components.camera.camera);
    });

    test('does not get affected by mixins', function (done) {
      let sceneEl = this.el.sceneEl;
      let assetsEl = document.querySelector('a-assets');
      let cameraEl = document.createElement('a-entity');
      let mixin = document.createElement('a-mixin');
      let cameraSystem = sceneEl.systems.camera;
      sinon.spy(cameraSystem, 'setActiveCamera');

      cameraEl.setAttribute('camera', '');
      mixin.setAttribute('camera', '');

      assetsEl.appendChild(mixin);
      mixin.addEventListener('loaded', function () {
        assert.ok(cameraSystem.setActiveCamera.notCalled);
        sceneEl.appendChild(cameraEl);
        cameraEl.addEventListener('loaded', function () {
          assert.ok(cameraEl.getAttribute('camera').active);
          assert.ok(cameraSystem.setActiveCamera.calledOnce);
          assert.equal(cameraSystem.activeCameraEl, cameraEl);
          cameraSystem.setActiveCamera.reset();
          done();
        });
      });
    });

    test('does not switch active camera to a mixin', function (done) {
      let sceneEl = this.el.sceneEl;
      let assetsEl = document.querySelector('a-assets');
      let cameraEl = document.createElement('a-entity');
      let mixin = document.createElement('a-mixin');
      let cameraSystem = sceneEl.systems.camera;
      sinon.spy(cameraSystem, 'setActiveCamera');

      cameraEl.setAttribute('camera', '');
      mixin.setAttribute('camera', '');

      sceneEl.appendChild(cameraEl);
      cameraEl.addEventListener('loaded', function () {
        assert.ok(cameraEl.getAttribute('camera').active);
        assert.ok(cameraSystem.setActiveCamera.calledOnce);
        assert.equal(cameraSystem.activeCameraEl, cameraEl);

        assetsEl.appendChild(mixin);
        mixin.addEventListener('loaded', function () {
          assert.ok(cameraEl.getAttribute('camera').active);
          assert.ok(cameraSystem.setActiveCamera.calledOnce);
          assert.equal(cameraSystem.activeCameraEl, cameraEl);
          cameraSystem.setActiveCamera.reset();
          done();
        });
      });
    });

    test('switches active camera', function (done) {
      let sceneEl = this.el.sceneEl;
      let camera1El = document.createElement('a-entity');
      let camera2El = document.createElement('a-entity');
      camera1El.setAttribute('camera', 'active: false');
      sceneEl.appendChild(camera1El);
      camera2El.setAttribute('camera', 'active: true');
      sceneEl.appendChild(camera2El);
      camera2El.addEventListener('loaded', function () {
        assert.notOk(camera1El.getAttribute('camera').active);
        sceneEl.systems.camera.setActiveCamera(camera1El);
        assert.notOk(camera2El.getAttribute('camera').active);
        done();
      });
    });

    test('disable inactive cameras', function (done) {
      let sceneEl = this.el.sceneEl;
      let cameraEl = document.createElement('a-entity');
      cameraEl.setAttribute('camera', 'active: false');
      sceneEl.appendChild(cameraEl);

      let camera2El = document.createElement('a-entity');
      camera2El.setAttribute('camera', 'active: false');
      sceneEl.appendChild(camera2El);

      camera2El.addEventListener('loaded', function () {
        cameraEl.setAttribute('camera', 'active: true');
        camera2El.setAttribute('camera', 'active: true');
        assert.notOk(cameraEl.getAttribute('camera').active);
        assert.ok(camera2El.getAttribute('camera').active, true);
        assert.equal(camera2El.components.camera.camera, sceneEl.camera);
        done();
      });
    });

    test('removes the default camera', function (done) {
      let cameraEl2 = document.createElement('a-entity');
      let sceneEl = this.el.sceneEl;
      cameraEl2.setAttribute('camera', 'active: true');
      process.nextTick(function () {
        sceneEl.appendChild(cameraEl2);
        // Need to setTimeout to wait for scene to remove element.
        cameraEl2.addEventListener('loaded', function () {
          assert.equal(cameraEl2.components.camera.camera, sceneEl.camera);
          assert.notOk(sceneEl.querySelector('[data-aframe-default-camera]'));
          done();
        });
      });
    });
  });
});
