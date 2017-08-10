/* global assert, suite, test */
var bind = require('utils/bind');

suite('utils.bind', function () {
  test('utils.bind binds to object', function () {
    var obj = {
      propName: 'aframe',
      getProp: function (arg) {
        return this.propName;
      }
    };
    assert.equal(obj.getProp(), bind(obj.getProp, obj)());
  });

  test('utils.bind binds properly when called by other object', function () {
    var obj = {
      propName: 'aframe',
      getProp: function (arg) {
        return this.propName;
      },
      getPropByCallback: function (cb) {
        return cb();
      }
    };
    var obj2 = {propName: 'webvr'};
    var bound = bind(obj.getProp, obj2);
    assert.equal(obj2.propName, bound());
    assert.equal(obj2.propName, obj.getPropByCallback(bound));
  });
});
