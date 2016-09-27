/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('tracked-controls', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('tracked-controls', '');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('tick', function () {
    test('pose and buttons update if mesh is not defined', function () {
      var el = this.el;
      var trackedControls = el.components['tracked-controls'];
      var updateButtonsSpy = this.sinon.spy(trackedControls, 'updateButtons');
      var updatePoseSpy = this.sinon.spy(trackedControls, 'updatePose');
      assert.equal(el.getObject3D('mesh'), undefined);
      trackedControls.tick();
      assert.ok(updatePoseSpy.called);
      assert.ok(updateButtonsSpy.called);
    });
  });
});
