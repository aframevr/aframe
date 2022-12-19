/* global assert, process, setup, suite, test, THREE */
var elFactory = require('../helpers').elFactory;

suite('attached', function () {
  var el;

  setup(function (done) {
    elFactory().then(_el => {
      el = _el;
      done();
    });
  });

  suite('update', function () {
    test('treats empty as true', function () {
      el.setAttribute('attached', '');
      assert.equal(el.object3D.parent, el.parentNode.object3D);
      assert.ok(el.attachedToScene);
    });

    test('can set to attached', function () {
      el.setAttribute('attached', true);
      assert.equal(el.object3D.parent, el.parentNode.object3D);
      assert.ok(el.attachedToScene);
    });

    test('can set to not attached', function () {
      el.setAttribute('attached', false);
      assert.equal(el.object3D.parent, null);
      assert.notOk(el.attachedToScene);
    });

    test('Non-default object3D parent maintained when detached & re-attached', function () {
      var alternateParent = new THREE.Group();
      alternateParent.add(el.object3D);
      el.setAttribute('attached', false);
      assert.equal(el.object3D.parent, null);
      assert.notOk(el.attachedToScene);
      el.setAttribute('attached', true);
      assert.equal(el.object3D.parent, alternateParent);
      assert.ok(el.attachedToScene);
    });

    test('getAttribute is affected by changes made direct to entity', function () {
      el.setAttribute('attached', true);
      assert.ok(el.getAttribute('attached'));
      el.detachFromScene();
      assert.notOk(el.getAttribute('attached'));
      el.attachToScene();
      assert.ok(el.getAttribute('attached'));
    });
  });
});
