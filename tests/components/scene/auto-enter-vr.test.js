/* global assert, process, setup, suite, test */
var entityFactory = require('../../helpers').entityFactory;

suite('auto-enter-vr', function () {
  suite('no getVRDisplay', function () {
    setup(function (done) {
      this.entityEl = entityFactory();
      var el = this.el = this.entityEl.parentNode;
      var resolvePromise = function () { return Promise.resolve(); };
      el.setAttribute('auto-enter-vr', '');
      el.effect = {
        requestPresent: resolvePromise,
        exitPresent: resolvePromise
      };
      var self = this;
      var autoEnterVR = el.components['auto-enter-vr'];
      el.addEventListener('loaded', function () {
        self.enterVRSpy = self.sinon.spy(autoEnterVR, 'enterVR');
        self.exitVRSpy = self.sinon.spy(autoEnterVR, 'exitVR');
        done();
      });
    });

    test('if no getVRDisplay, then !shouldAutoEnterVR and !enterVR', function () {
      var el = this.el;
      var autoEnterVR = el.components['auto-enter-vr'];
      assert.notOk(el.effect.getVRDisplay);
      assert.notOk(autoEnterVR.shouldAutoEnterVR());
      process.nextTick(function () {
        assert.notOk(this.enterVRSpy.called);
      });
    });
  });

  suite('!getVRDisplay()', function () {
    setup(function (done) {
      this.entityEl = entityFactory();
      var el = this.el = this.entityEl.parentNode;
      var resolvePromise = function () { return Promise.resolve(); };
      el.setAttribute('auto-enter-vr', '');
      el.effect = {
        getVRDisplay: function () { return null; },
        requestPresent: resolvePromise,
        exitPresent: resolvePromise
      };
      var self = this;
      var autoEnterVR = el.components['auto-enter-vr'];
      el.addEventListener('loaded', function () {
        self.enterVRSpy = self.sinon.spy(autoEnterVR, 'enterVR');
        self.exitVRSpy = self.sinon.spy(autoEnterVR, 'exitVR');
        done();
      });
    });

    test('if !getVRDisplay(), then !shouldAutoEnterVR and !enterVR', function () {
      var el = this.el;
      var autoEnterVR = el.components['auto-enter-vr'];
      assert.ok(el.effect.getVRDisplay);
      assert.notOk(el.effect.getVRDisplay());
      assert.notOk(autoEnterVR.shouldAutoEnterVR());
      process.nextTick(function () {
        assert.notOk(this.enterVRSpy.called);
      });
    });
  });

  suite('no getVRDisplay() displayName', function () {
    setup(function (done) {
      this.entityEl = entityFactory();
      var el = this.el = this.entityEl.parentNode;
      var resolvePromise = function () { return Promise.resolve(); };
      el.setAttribute('auto-enter-vr', '');
      el.effect = {
        getVRDisplay: function () { return {}; },
        requestPresent: resolvePromise,
        exitPresent: resolvePromise
      };
      var self = this;
      var autoEnterVR = el.components['auto-enter-vr'];
      el.addEventListener('loaded', function () {
        self.enterVRSpy = self.sinon.spy(autoEnterVR, 'enterVR');
        self.exitVRSpy = self.sinon.spy(autoEnterVR, 'exitVR');
        done();
      });
    });

    test('if no getVRDisplay().displayName, then !shouldAutoEnterVR and !enterVR', function () {
      var el = this.el;
      var autoEnterVR = el.components['auto-enter-vr'];
      assert.ok(el.effect.getVRDisplay);
      assert.notOk(el.effect.getVRDisplay().displayName);
      assert.notOk(autoEnterVR.shouldAutoEnterVR());
      process.nextTick(function () {
        assert.notOk(this.enterVRSpy.called);
      });
    });
  });

  suite('getVRDisplay() displayName something else', function () {
    setup(function (done) {
      this.entityEl = entityFactory();
      var el = this.el = this.entityEl.parentNode;
      var resolvePromise = function () { return Promise.resolve(); };
      el.setAttribute('auto-enter-vr', '');
      el.effect = {
        getVRDisplay: function () { return {displayName: 'something else'}; },
        requestPresent: resolvePromise,
        exitPresent: resolvePromise
      };
      var self = this;
      var autoEnterVR = el.components['auto-enter-vr'];
      el.addEventListener('loaded', function () {
        self.enterVRSpy = self.sinon.spy(autoEnterVR, 'enterVR');
        self.exitVRSpy = self.sinon.spy(autoEnterVR, 'exitVR');
        done();
      });
    });

    test('if getVRDisplay().displayName something else, then !shouldAutoEnterVR and !enterVR', function () {
      var el = this.el;
      var autoEnterVR = el.components['auto-enter-vr'];
      assert.ok(el.effect.getVRDisplay);
      assert.ok(el.effect.getVRDisplay().displayName);
      assert.notOk(el.effect.getVRDisplay().displayName.indexOf('GearVR') >= 0);
      assert.notOk(autoEnterVR.shouldAutoEnterVR());
      process.nextTick(function () {
        assert.notOk(this.enterVRSpy.called);
      });
    });
  });

  suite('getVRDisplay() displayName GearVR something', function () {
    setup(function (done) {
      this.entityEl = entityFactory();
      var el = this.el = this.entityEl.parentNode;
      var resolvePromise = function () { return Promise.resolve(); };
      el.setAttribute('auto-enter-vr', '');
      el.effect = {
        getVRDisplay: function () { return {displayName: 'GearVR something'}; },
        requestPresent: resolvePromise,
        exitPresent: resolvePromise
      };
      var self = this;
      var autoEnterVR = el.components['auto-enter-vr'];
      el.addEventListener('loaded', function () {
        self.enterVRSpy = self.sinon.spy(autoEnterVR, 'enterVR');
        self.exitVRSpy = self.sinon.spy(autoEnterVR, 'exitVR');
        done();
      });
    });

    test('if getVRDisplay().displayName has GearVR, then shouldAutoEnterVR and enterVR', function () {
      var el = this.el;
      var autoEnterVR = el.components['auto-enter-vr'];
      assert.ok(el.effect.getVRDisplay);
      assert.ok(el.effect.getVRDisplay().displayName);
      assert.ok(el.effect.getVRDisplay().displayName.indexOf('GearVR') >= 0);
      assert.ok(autoEnterVR.shouldAutoEnterVR());
      process.nextTick(function () {
        assert.ok(this.enterVRSpy.called);
      });
    });
  });
});
