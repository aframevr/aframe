/* global assert, sinon, suite, test */
let trackedControlsUtils = require('utils/tracked-controls');

suite('onButtonEvent', function () {
  test('reemit button event based on mappings', function () {
    let mockedComponent = {
      el: {emit: sinon.stub()},
      mapping: {buttons: ['testbutton']},
      updateModel: sinon.stub()
    };
    trackedControlsUtils.onButtonEvent(0, 'up', mockedComponent);
    assert.isTrue(mockedComponent.updateModel.called);
    assert.isTrue(mockedComponent.el.emit.calledWith('testbuttonup'));
  });

  test('reemit button event based on mappings with handedness', function () {
    let mockedComponent = {
      el: {emit: sinon.stub()},
      mapping: {left: {buttons: ['testbutton']}},
      updateModel: sinon.stub()
    };
    trackedControlsUtils.onButtonEvent(0, 'up', mockedComponent, 'left');
    assert.isTrue(mockedComponent.updateModel.called);
    assert.isTrue(mockedComponent.el.emit.calledWith('testbuttonup'));
  });
});
