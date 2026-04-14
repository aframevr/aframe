/* global assert, sinon, setup, suite, test */
import { entityFactory } from '../helpers.js';
import * as trackedControlsUtils from 'utils/tracked-controls.js';

suite('checkControllerPresentAndSetup', function () {
  var el;
  var system;

  setup(function (done) {
    el = entityFactory();
    setTimeout(() => {
      el.sceneEl.addEventListener('loaded', function () {
        system = el.sceneEl.systems['tracked-controls'];
        el.setAttribute('meta-touch-controls', {hand: 'left', model: false});
        done();
      });
    });
  });

  test('tracked-controls.controller is set when controllerconnected fires on reconnect', function (done) {
    var controller = {
      handedness: 'left',
      profiles: ['oculus-touch-v3']
    };

    // Simulate the xrSession inputsourceschange event by setting
    // system.controllers and emitting controllersupdated, which is what
    // the tracked-controls system does in onInputSourcesChange.

    // First connection.
    system.controllers = [controller];
    el.sceneEl.emit('controllersupdated', undefined, false);
    var updateControllerSpy = sinon.spy(el.components['tracked-controls'], 'updateController');

    assert.ok(el.components['tracked-controls'].controller, 'controller set on first connect');

    // Disconnect.
    system.controllers = [];
    el.sceneEl.emit('controllersupdated', undefined, false);
    assert.notOk(el.components['tracked-controls'].controller, 'controller cleared on disconnect');

    // Reconnect. injectTrackedControls calls setAttribute('tracked-controls', ...)
    // with the same data as the first connection, so update/updateController would be
    // skipped without the explicit updateController call in checkControllerPresentAndSetup.
    system.controllers = [controller];
    el.addEventListener('controllerconnected', function () {
      assert.ok(updateControllerSpy.called,
                'updateController must be called before controllerconnected fires');
      assert.ok(el.components['tracked-controls'].controller,
                'controller must be set when controllerconnected fires on reconnect');
      done();
    });
    el.sceneEl.emit('controllersupdated', undefined, false);
  });
});

suite('onButtonEvent', function () {
  test('reemit button event based on mappings', function () {
    var mockedComponent = {
      el: {emit: sinon.stub()},
      mapping: {buttons: ['testbutton']},
      updateModel: sinon.stub()
    };
    trackedControlsUtils.onButtonEvent(0, 'up', mockedComponent);
    assert.isTrue(mockedComponent.updateModel.called);
    assert.isTrue(mockedComponent.el.emit.calledWith('testbuttonup'));
  });

  test('reemit button event based on mappings with handedness', function () {
    var mockedComponent = {
      el: {emit: sinon.stub()},
      mapping: {left: {buttons: ['testbutton']}},
      updateModel: sinon.stub()
    };
    trackedControlsUtils.onButtonEvent(0, 'up', mockedComponent, 'left');
    assert.isTrue(mockedComponent.updateModel.called);
    assert.isTrue(mockedComponent.el.emit.calledWith('testbuttonup'));
  });
});
