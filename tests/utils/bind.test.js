/* global assert, suite, test */
let bind = require('utils/bind');

suite('utils.bind', function () {
  test('utils.bind binds to object', function () {
    let obj = {
      propName: 'aframe',
      getProp: function (arg) {
        return this.propName;
      }
    };
    assert.equal(obj.getProp(), bind(obj.getProp, obj)());
  });

  test('utils.bind binds properly when called by other object', function () {
    let obj = {
      propName: 'aframe',
      getProp: function (arg) {
        return this.propName;
      },
      getPropByCallback: function (cb) {
        return cb();
      }
    };
    let obj2 = {
      propName: 'webvr'
    };
    let bound = bind(obj.getProp, obj2);
    assert.equal(obj2.propName, bound());
    assert.equal(obj2.propName, obj.getPropByCallback(bound));
  });

  test('utils.bind accepts and handles additional arguments properly', function () {
    let firstArg = 'awesome';
    let secondArg = {};
    let obj = {
      propName: 'aframe',
      getPropertyByCallback: function (arg1, arg2, arg3) {
        assert.equal(arg1, firstArg);
        assert.equal(arg2, secondArg);
        assert.equal(arg3, obj.propName);
      }
    };
    let bound = bind(obj.getPropertyByCallback, obj, firstArg, secondArg);
    bound(obj.propName);
  });
});
