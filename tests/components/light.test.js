/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('light', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('light', '');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('update', function () {
    test('creates light', function () {
      assert.equal(this.el.getObject3D('light').type, 'DirectionalLight');
    });

    test('updates light', function () {
      var el = this.el;
      el.setAttribute('light', 'color: #F0F');
      assert.shallowDeepEqual(el.getObject3D('light').color, {r: 1, g: 0, b: 1});
    });

    test('does not recreate light for basic updates', function () {
      var el = this.el;
      var uuid = el.getObject3D('light').uuid;
      el.setAttribute('light', 'color: #F0F');
      assert.equal(el.getObject3D('light').uuid, uuid);
    });

    test('can switch between types of light', function () {
      var el = this.el;
      el.setAttribute('light', 'type: ambient');
      assert.equal(el.getObject3D('light').type, 'AmbientLight');
    });

    test('can update parameters on updated light', function () {
      var el = this.el;
      el.setAttribute('light', 'intensity: 5');
      assert.equal(el.getObject3D('light').intensity, 5);
    });

    test('can update spotlight angle', function () {
      var el = this.el;
      el.setAttribute('light', 'type: spot');
      el.setAttribute('light', 'angle', 90);
      assert.equal(el.getObject3D('light').angle, Math.PI / 2);
      el.setAttribute('light', 'angle', 180);
      assert.equal(el.getObject3D('light').angle, Math.PI);
    });
  });

  suite('getLight', function () {
    test('can get ambient light', function () {
      var el = this.el;
      el.setAttribute('light', 'type: ambient');
      assert.equal(el.getObject3D('light').type, 'AmbientLight');
    });

    test('can get directional light', function () {
      var el = this.el;
      el.setAttribute('light', 'type: directional');
      assert.equal(el.getObject3D('light').type, 'DirectionalLight');
    });

    test('can get hemisphere light', function () {
      var el = this.el;
      el.setAttribute('light', 'type: hemisphere');
      assert.equal(el.getObject3D('light').type, 'HemisphereLight');
    });

    test('can get point light', function () {
      var el = this.el;
      el.setAttribute('light', 'type: point');
      assert.equal(el.getObject3D('light').type, 'PointLight');
    });

    test('can get spot light', function () {
      var el = this.el;
      var light;
      el.setAttribute('light', 'type: spot; angle: 180; penumbra: 0.5');
      light = el.getObject3D('light');
      assert.equal(light.type, 'SpotLight');
      assert.equal(light.angle, Math.PI);
      assert.equal(light.penumbra, 0.5);
    });

    test('handles invalid type', function () {
      var el = this.el;
      el.setAttribute('light', 'type: black');
      assert.equal(el.getObject3D('light').type, 'DirectionalLight');
    });
  });

  suite('remove', function () {
    test('removes light', function () {
      var el = this.el;
      el.removeAttribute('light');
      assert.equal(el.object3D.children.length, 0);
    });
  });

  suite('setLight', function () {
    test('set a light with incorrect data', function () {
      var el = this.el;
      var oldLight = this.el.components.light.light;

      el.components.light.setLight({type: 'nonvalidtype'});
      assert.equal(oldLight, el.components.light.light);
    });

    test('set a light with correct data', function () {
      var el = this.el;
      var oldLight = this.el.components.light.light;

      el.components.light.setLight({type: 'spot'});
      assert.notEqual(oldLight, el.components.light.light);
      assert.equal(oldLight.parent, null);
    });

    test('temp bugfix issue #1624: spotlight object3d position is at spotlight element position', function () {
      var lightEl = this.el;
      var light;

      lightEl.setAttribute('light', 'type', 'spot');
      light = lightEl.getObject3D('light');

      assert.equal(lightEl.object3D.position.x, light.getWorldPosition().x);
      assert.equal(lightEl.object3D.position.y, light.getWorldPosition().y);
      assert.equal(lightEl.object3D.position.z, light.getWorldPosition().z);
    });
  });

  suite('light target', function () {
    test('spotlight: set light target with selector when light is created', function () {
      var sceneEl = this.el.sceneEl;
      var lightEl = this.el;
      var targetEl = document.createElement('a-entity');

      sceneEl.appendChild(targetEl);
      targetEl.setAttribute('id', 'target');
      lightEl.setAttribute('light', 'type: spot; target: #target');

      assert.strictEqual(lightEl.getObject3D('light').target, targetEl.object3D);
    });

    test('spotlight: change light target with selector', function () {
      var sceneEl = this.el.sceneEl;
      var lightEl = this.el;
      var targetEl = document.createElement('a-entity');
      var othertargetEl = document.createElement('a-entity');

      targetEl.setAttribute('id', 'target');
      othertargetEl.setAttribute('id', 'othertarget');
      sceneEl.appendChild(targetEl);
      sceneEl.appendChild(othertargetEl);

      lightEl.setAttribute('light', 'type: spot');
      lightEl.setAttribute('light', 'target: #target');
      lightEl.setAttribute('light', 'target: #othertarget');

      assert.strictEqual(lightEl.getObject3D('light').target, othertargetEl.object3D);
    });

    test('spotlight: when created, light target is child object positioned at 0 0 -1', function () {
      var lightEl = this.el;
      var light, lightTarget;

      lightEl.setAttribute('light', 'type: spot');
      light = lightEl.getObject3D('light');
      lightTarget = lightEl.getObject3D('light-target');

      assert.equal(lightTarget.uuid, light.target.uuid);
      assert.equal(lightTarget.position.x, 0);
      assert.equal(lightTarget.position.y, 0);
      assert.equal(lightTarget.position.z, -1);
    });

    test('spotlight: when target is changed to null, light target is child object positioned at 0 0 -1', function () {
      var sceneEl = this.el.sceneEl;
      var lightEl = this.el;
      var targetEl = document.createElement('a-entity');
      var light, lightTarget;

      targetEl.setAttribute('id', 'target');
      sceneEl.appendChild(targetEl);

      lightEl.setAttribute('light', 'type: spot');
      lightEl.setAttribute('light', 'target', '#target');
      lightEl.setAttribute('light', 'target', null);

      light = lightEl.getObject3D('light');
      lightTarget = lightEl.getObject3D('light-target');

      assert.equal(lightTarget.uuid, light.target.uuid);
      assert.equal(lightTarget.position.x, 0);
      assert.equal(lightTarget.position.y, 0);
      assert.equal(lightTarget.position.z, -1);
    });

    test('directional: set light target with selector when light is created', function () {
      var sceneEl = this.el.sceneEl;
      var lightEl = this.el;
      var targetEl = document.createElement('a-entity');

      sceneEl.appendChild(targetEl);
      targetEl.setAttribute('id', 'target');

      lightEl.setAttribute('light', 'type: directional; target: #target');

      assert.strictEqual(lightEl.getObject3D('light').target, targetEl.object3D);
    });

    test('directional: change light target with selector', function () {
      var sceneEl = this.el.sceneEl;
      var lightEl = this.el;
      var targetEl = document.createElement('a-entity');
      var othertargetEl = document.createElement('a-entity');

      targetEl.setAttribute('id', 'target');
      othertargetEl.setAttribute('id', 'othertarget');
      sceneEl.appendChild(targetEl);
      sceneEl.appendChild(othertargetEl);

      lightEl.setAttribute('light', 'type: directional');
      lightEl.setAttribute('light', 'target: #target');
      lightEl.setAttribute('light', 'target: #othertarget');

      assert.strictEqual(lightEl.getObject3D('light').target, othertargetEl.object3D);
    });

    test('directional: when created, light target is positioned at 0 0 0, but NOT a child', function () {
      var lightEl = this.el;
      var light;

      lightEl.setAttribute('light', 'type: directional');
      light = lightEl.getObject3D('light');

      assert.typeOf(light.target, 'object');
      assert.equal(light.children.length, 0);
      assert.equal(lightEl.object3D.children.length, 1);
      assert.equal(light.target.position.x, 0);
      assert.equal(light.target.position.y, 0);
      assert.equal(light.target.position.z, 0);
    });

    test('directional: when target is changed to null, light target is positioned at 0 0 0, but NOT a child', function () {
      var sceneEl = this.el.sceneEl;
      var lightEl = this.el;
      var targetEl = document.createElement('a-entity');
      var light;

      targetEl.setAttribute('id', 'target');
      sceneEl.appendChild(targetEl);

      lightEl.setAttribute('light', 'type: directional');
      lightEl.setAttribute('light', 'target', '#target');
      lightEl.setAttribute('light', 'target', null);
      light = lightEl.getObject3D('light');

      assert.typeOf(light.target, 'object');
      assert.equal(light.children.length, 0);
      assert.equal(lightEl.object3D.children.length, 1);
      assert.equal(light.target.position.x, 0);
      assert.equal(light.target.position.y, 0);
      assert.equal(light.target.position.z, 0);
    });
  });
});
