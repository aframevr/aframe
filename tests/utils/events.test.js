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
    test('successfully binds and unbinds to the event.', function () {
      var spy = this.sinon.spy();
      var el = this.el;
      AFRAME.registerComponent('bind-event-test-1', {
        someevent: bindEvent(function () { spy(); }),
        someotherevent: bindEvent(function () { spy(); })
      });
      el.setAttribute('bind-event-test-1', '');
      el.emit('someevent');
      assert.equal(spy.getCalls().length, 1);
      el.emit('someotherevent');
      assert.equal(spy.getCalls().length, 2);
      el.removeAttribute('bind-event-test-1');
      el.emit('someevent');
      assert.equal(spy.getCalls().length, 2);
    });
  });
});
