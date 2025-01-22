/* global assert, sinon, suite, test */
import * as trackedControlsUtils from 'utils/tracked-controls.js';

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
