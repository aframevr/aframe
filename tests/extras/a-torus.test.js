/* global assert, suite, test, setup */
suite('a-torus', function () {
  var scene;
  var torus;
  var torus2;
  setup(function (done) {
    scene = document.createElement('a-scene');
    torus = document.createElement('a-torus');
    document.body.appendChild(scene);
    scene.appendChild(torus);
    torus2 = document.createElement('a-torus');
    torus2.addEventListener('loaded', function () {
      done();
    });
    torus2.setAttribute('segments-tubular', '100');
    torus2.setAttribute('radius', '2');
    torus2.setAttribute('radius-tubular', '0.1');
    scene.appendChild(torus2);
  });

  test('has default position when created', function () {
    assert.deepEqual(torus.getComputedAttribute('position'), { x: 0, y: 0, z: 0 });
  });

  test('has torus geometry', function () {
    assert.strictEqual(torus.getAttribute('geometry').primitive, 'torus');
  });

  test('has inherited attributes on geometry', function () {
    var geometry = torus2.getAttribute('geometry');
    assert.strictEqual(geometry.primitive, 'torus');
    assert.strictEqual(geometry.segmentsTubular, 100);
    assert.strictEqual(geometry.radius, 2);
    assert.strictEqual(geometry.radiusTubular, 0.1);
  });
});
