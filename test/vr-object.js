/* global assert, expect, setup, sinon, suite, teardown, test */
suite('vr-object', function () {
  'use strict';

  window.debug = true;
  var VRObject = require('core/vr-object');

  setup(function () {
    this.sinon = sinon.sandbox.create();
  });

  teardown(function () {
    this.sinon.restore();
  });

  suite('createdCallback', function () {
    setup(function () {
      this.sinon.spy(VRObject.prototype, 'createdCallback');
      this.sinon.spy(VRObject.prototype, 'load');
      this.el = document.createElement('vr-object');
    });

    teardown(function () {
      this.el = null;
    });

    test('is called on element creation', function () {
      sinon.assert.called(VRObject.prototype.createdCallback);
    });

    test('A 3D object is initialized', function () {
      assert.isDefined(this.el.object3D);
    });

    test('The load method is called', function () {
      sinon.assert.called(VRObject.prototype.load);
    });
  });

  suite('attributeChangedCallback', function () {
    setup(function () {
      this.sinon.spy(VRObject.prototype, 'attributeChangedCallback');
      this.el = document.createElement('vr-object');
    });

    teardown(function () {
      this.el = null;
    });

    test('is called on attribute changed', function (done) {
      var el = this.el;
      var position = {x: 0, y: 10, z: 0};
      el.setAttribute('position', position);
      process.nextTick(function () {
        sinon.assert.calledWith(
          VRObject.prototype.attributeChangedCallback,
          'position', '0 0 0', position);
        done();
      });
    });

    test('The position coordinates change with a string', function () {
      var el = this.el;
      var position;
      el.setAttribute('position', '10 20 30');
      position = el.getAttribute('position');
      assert.shallowDeepEqual(position, {x: 10, y: 20, z: 30});
    });

    test('The position coordinates change with an object', function () {
      var el = this.el;
      var position;
      el.setAttribute('position', {x: 10, y: 20, z: 30});
      position = el.getAttribute('position');
      assert.shallowDeepEqual(position, {x: 10, y: 20, z: 30});
    });

    test('The rotation values change with a string', function () {
      var el = this.el;
      var rotation;
      el.setAttribute('rotation', '30 45 60');
      rotation = el.getAttribute('rotation');
      assert.shallowDeepEqual(rotation, {x: 30, y: 45, z: 60});
    });

    test('The rotation values change with an object', function () {
      var el = this.el;
      var rotation;
      el.setAttribute('rotation', {x: 30, y: 45, z: 60});
      rotation = el.getAttribute('rotation');
      assert.shallowDeepEqual(rotation, {x: 30, y: 45, z: 60});
    });

    test('The scaling factors change with a string', function () {
      var el = this.el;
      var scale;
      el.setAttribute('scale', '2.0 4.0 8.0');
      scale = el.getAttribute('scale');
      assert.shallowDeepEqual(scale, {x: 2.0, y: 4.0, z: 8.0});
    });

    test('The scaling factors change with an object', function () {
      var el = this.el;
      var scale;
      el.setAttribute('scale', {x: 2.0, y: 4.0, z: 8.0});
      scale = el.getAttribute('scale');
      assert.shallowDeepEqual(scale, {x: 2.0, y: 4.0, z: 8.0});
    });

    test('The rotation order is maintained', function () {
      var el = this.el;
      el.setAttribute('scale', '2.0 4.0 8.0');
      assert.equal(el.object3D.rotation.order, 'YXZ');
    });
  });

  suite('attachedCallback', function () {
    setup(function () {
      this.sinon.spy(VRObject.prototype, 'attachedCallback');
      var parent = this.parent = document.createElement('div');
      document.body.appendChild(parent);
      var el = this.el = document.createElement('vr-object');
      sinon.stub(el, 'addToParent');
    });

    teardown(function () {
      this.el = null;
      this.parent = null;
    });

    test('is called after appending the element', function (done) {
      var el = this.el;
      this.parent.appendChild(el);
      process.nextTick(function () {
        sinon.assert.called(VRObject.prototype.attachedCallback);
        done();
      });
    });

    test('The element adds itself to the parent if it has loaded', function (done) {
      var el = this.el;
      el.hasLoaded = true;
      this.parent.appendChild(el);
      process.nextTick(function () {
        sinon.assert.called(el.addToParent);
        done();
      });
    });

    test('The element DOES NOT add itself to the parent if it has NOT loaded', function (done) {
      var el = this.el;
      el.hasLoaded = false;
      this.parent.appendChild(el);
      process.nextTick(function () {
        sinon.assert.notCalled(el.addToParent);
        done();
      });
    });
  });

  suite('detachedCallback', function () {
    setup(function () {
      this.sinon.spy(VRObject.prototype, 'detachedCallback');
      var parent = this.parent = document.createElement('div');
      document.body.appendChild(parent);
      var el = this.el = document.createElement('vr-object');
      sinon.stub(el, 'addToParent');
      parent.appendChild(el);
      el.parentEl = {remove: function () {}};
      this.parentMock = this.sinon.mock(el.parentEl);
    //   mock.expects('save')
    // .once()
    });

    teardown(function () {
      this.el = null;
      this.parent = null;
    });

    test('is called after removing the element from the parent', function (done) {
      var el = this.el;
      this.parent.removeChild(el);
      process.nextTick(function () {
        sinon.assert.called(VRObject.prototype.detachedCallback);
        done();
      });
    });

    test('The object3D is removed from the parent', function (done) {
      var el = this.el;
      var parentMock = this.parentMock.expects('remove').once();
      this.parent.removeChild(el);
      process.nextTick(function () {
        parentMock.verify();
        sinon.assert.called(VRObject.prototype.detachedCallback);
        done();
      });
    });
  });

  suite('add', function () {
    setup(function () {
      var parent = this.parent = document.createElement('vr-object');
      this.objectMock = this.sinon.mock(parent.object3D);
      this.child = document.createElement('vr-object');
    });

    teardown(function () {
      this.parent = null;
      this.child = null;
    });

    test('is called the child object is added to the parent object3D', function () {
      var parent = this.parent;
      var objectMock = this.objectMock;
      objectMock.expects('add').once();
      parent.add(this.child);
      objectMock.verify();
    });

    test('the child object3D is not added to the parent if it is not defined', function () {
      var parent = this.parent;
      var objectMock = this.objectMock;
      var spy = this.sinon.spy(VRObject.prototype, 'add');
      objectMock.expects('add').never();
      this.child.object3D = null;
      try {
        parent.add(this.child);
      } catch (e) {
        expect(spy).to.have.thrown();
        objectMock.verify();
      }
    });
  });

  suite('addToParent', function () {
    setup(function () {
      var parent = this.parent = document.createElement('vr-object');
      var child = this.child = document.createElement('vr-object');
      sinon.stub(parent, 'add');
      parent.appendChild(child);
    });

    teardown(function () {
      this.parent = null;
      this.child = null;
    });

    test('add is called if the child has a parent and has not been added already', function () {
      this.child.attachedToParent = false;
      this.child.addToParent();
      sinon.assert.called(this.parent.add);
    });

    test('the child element is flagged as attached after being added to parent', function () {
      this.child.attachedToParent = false;
      this.child.addToParent();
      assert.isTrue(this.child.attachedToParent);
    });

    test('the child element is not added to parent if it is already attached', function () {
      this.child.attachedToParent = true;
      this.child.addToParent();
      sinon.assert.notCalled(this.parent.add);
    });
  });

  suite('load', function () {
    setup(function () {
      this.sinon.spy(VRObject.prototype, 'load');
    });

    test('load is called when the object is created', function () {
      document.createElement('vr-object');
      sinon.assert.called(VRObject.prototype.load);
    });

    test('load returns if the object has already loaded', function () {
      var el = document.createElement('vr-object');
      this.sinon.spy(VRObject.prototype, 'addToParent');
      this.sinon.spy(VRObject.prototype, 'initAttributes');
      this.sinon.spy(VRObject.prototype, 'attributeChangedCallback');
      el.load();
      sinon.assert.notCalled(VRObject.prototype.addToParent);
      sinon.assert.notCalled(VRObject.prototype.initAttributes);
      sinon.assert.notCalled(VRObject.prototype.attributeChangedCallback);
    });

    test('load returns if the object has already loaded', function () {
      var el = document.createElement('vr-object');
      this.sinon.stub(VRObject.prototype, 'addToParent');
      this.sinon.stub(VRObject.prototype, 'addAnimations');
      this.sinon.stub(VRObject.prototype, 'initAttributes');
      this.sinon.stub(VRObject.prototype, 'attributeChangedCallback');
      el.load();
      sinon.assert.notCalled(VRObject.prototype.addToParent);
      sinon.assert.notCalled(VRObject.prototype.addAnimations);
      sinon.assert.notCalled(VRObject.prototype.initAttributes);
      sinon.assert.notCalled(VRObject.prototype.attributeChangedCallback);
    });

    test('load runs if the object has not yet loaded', function () {
      var el = document.createElement('vr-object');
      el.hasLoaded = false;
      this.sinon.stub(VRObject.prototype, 'addToParent');
      this.sinon.stub(VRObject.prototype, 'addAnimations');
      this.sinon.stub(VRObject.prototype, 'initAttributes');
      el.load();
      sinon.assert.calledOnce(VRObject.prototype.addToParent);
      sinon.assert.calledOnce(VRObject.prototype.addAnimations);
      sinon.assert.calledOnce(VRObject.prototype.initAttributes);
    });
  });

  suite('setAttribute', function () {
    setup(function () {
      this.el = document.createElement('vr-object');
    });

    teardown(function () {
      this.parent = null;
      this.child = null;
    });

    test('position is set when passing an object', function () {
      var positionObj = {
        x: 10,
        y: 20,
        z: 30
      };
      this.el.setAttribute('position', positionObj);
      var position = this.el.getAttribute('position');
      assert.deepEqual(position, positionObj);
    });

    test('position is set when passing a string', function () {
      var positionObj = {
        x: 10,
        y: 20,
        z: 30
      };
      var positionStr = '10 20 30';
      this.el.setAttribute('position', positionStr);
      var position = this.el.getAttribute('position');
      assert.deepEqual(position, positionObj);
    });

    test('position is set to null when passing an empty string', function () {
      this.el.setAttribute('position', '');
      var position = this.el.getAttribute('position');
      assert.isNull(position);
    });
  });

  suite('remove', function () {
    setup(function () {
      var parent = this.parent = document.createElement('vr-object');
      this.objectMock = this.sinon.mock(parent.object3D);
      this.child = document.createElement('vr-object');
    });

    teardown(function () {
      this.parent = null;
      this.child = null;
    });

    test('is called on the object3D', function () {
      var parent = this.parent;
      var objectMock = this.objectMock;
      objectMock.expects('remove').once();
      parent.remove(this.child);
      objectMock.verify();
    });
  });

  suite('initAttributes', function () {
    setup(function () {
      this.el = document.createElement('vr-object');
      this.sinon.spy(VRObject.prototype, 'attributeChangedCallback');
    });

    teardown(function () {
      this.el = null;
    });

    test('position, rotation and scale are given default values', function () {
      var el = this.el;
      var defaultPosition = {x: 0, y: 0, z: 0};
      var defaultRotation = {x: 0, y: 0, z: 0};
      var defaultScale = {x: 1, y: 1, z: 1};
      el.setAttribute('position', '');
      el.setAttribute('rotation', '');
      el.setAttribute('scale', '');
      el.initAttributes();
      var position = this.el.getAttribute('position');
      var rotation = this.el.getAttribute('rotation');
      var scale = this.el.getAttribute('scale');
      assert.deepEqual(position, defaultPosition);
      assert.deepEqual(rotation, defaultRotation);
      assert.deepEqual(scale, defaultScale);
    });

    test('position, rotation and scale are not set to default if defined', function () {
      var el = this.el;
      var customPosition = {x: -10, y: -20, z: -30};
      var customRotation = {x: -45, y: 0, z: 45};
      var customScale = {x: 2.5, y: 3.5, z: 4.5};
      el.setAttribute('position', customPosition);
      el.setAttribute('rotation', customRotation);
      el.setAttribute('scale', customScale);
      el.initAttributes();
      var position = this.el.getAttribute('position');
      var rotation = this.el.getAttribute('rotation');
      var scale = this.el.getAttribute('scale');
      assert.deepEqual(position, customPosition);
      assert.deepEqual(rotation, customRotation);
      assert.deepEqual(scale, customScale);
    });

    test('position, rotation and scale are not set to default if defined', function () {
      var el = this.el;
      var customPosition = {x: -10, y: -20, z: -30};
      var customRotation = {x: -45, y: 0, z: 45};
      var customScale = {x: 2.5, y: 3.5, z: 4.5};
      el.setAttribute('position', customPosition);
      el.setAttribute('rotation', customRotation);
      el.setAttribute('scale', customScale);
      el.initAttributes();
      sinon.assert.calledOnce(VRObject.prototype.attributeChangedCallback);
    });
  });

  suite('getAttribute', function () {
    setup(function () {
      this.el = document.createElement('vr-object');
    });

    teardown(function () {
      this.el = null;
    });

    test('returns null for a not defined attribute', function () {
      var el = this.el;
      var height = el.getAttribute('height');
      assert.isNull(height);
    });

    test('returns correct value for a defined attribute', function () {
      var el = this.el;
      var positionObj = {x: 23, y: 24, z: 25};
      el.setAttribute('position', positionObj);
      var position = el.getAttribute('position');
      assert.deepEqual(position, positionObj);
    });
  });
});
