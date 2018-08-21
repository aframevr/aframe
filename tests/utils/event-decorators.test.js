/* global AFRAME, assert, setup, suite, test */
var helpers = require('../helpers');
var bindEvent = require('utils/').bindEvent;

suite('utils.bindEvent', function () {
  setup(function (done) {
    var el = this.el = helpers.entityFactory();
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('bindEvent', function () {
    test('works when passed a function only', function () {
      var spy = this.sinon.spy();
      AFRAME.registerComponent('bind-event-test-1', {
        someevent: bindEvent(function () { spy(); }),
        someotherevent: bindEvent(function () { spy(); })
      });
      var el = this.el;
      el.setAttribute('bind-event-test-1', '');
      el.emit('someevent');
      assert.equal(spy.getCalls().length, 1);
      el.emit('someotherevent');
      assert.equal(spy.getCalls().length, 2);
      el.removeAttribute('bind-event-test-1');
      el.emit('someevent');
      assert.equal(spy.getCalls().length, 2);
    });

    test('works when passed a config object and function', function () {
      var spy = this.sinon.spy();
      AFRAME.registerComponent('bind-event-test-2', {
        myEventHandler: bindEvent({
          event: 'someevent',
          target: 'a-scene',
          listenIn: 'init',
          removeIn: 'remove'
        }, function () {
          spy();
        })
      });
      var el = this.el;
      var sceneEl = el.sceneEl;
      el.setAttribute('bind-event-test-2', '');
      sceneEl.emit('someevent');
      assert.equal(spy.getCalls().length, 1);
      el.removeAttribute('bind-event-test-2');
      sceneEl.emit('someevent');
      assert.equal(spy.getCalls().length, 1);
    });
  });
});
