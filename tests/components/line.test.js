/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('line', function () {
  var el;
  var component;

  setup(function (done) {
    el = this.el = entityFactory();
    el.setAttribute('line', '');
    if (el.hasLoaded) { done(); }
    el.addEventListener('componentinitialized', function (evt) {
      if (evt.detail.name !== 'line') { return; }
      component = el.components.line;
      done();
    });
  });

  suite('init', function () {
    test('set start and end position', function () {
      el.setAttribute('line', {start: '1 2 3', end: '4 5 6'});
      var positionArray = component.geometry.attributes.position.array;
      assert.equal(positionArray[0], 1);
      assert.equal(positionArray[1], 2);
      assert.equal(positionArray[2], 3);
      assert.equal(positionArray[3], 4);
      assert.equal(positionArray[4], 5);
      assert.equal(positionArray[5], 6);
    });

    test('set start but no end position', function () {
      el.setAttribute('line', {start: '1 2 3'});
      var positionArray = component.geometry.attributes.position.array;
      assert.equal(positionArray[0], 1);
      assert.equal(positionArray[1], 2);
      assert.equal(positionArray[2], 3);
      assert.equal(positionArray[3], 0);
      assert.equal(positionArray[4], 0);
      assert.equal(positionArray[5], 0);
    });

    test('set end but no start position', function () {
      el.setAttribute('line', {end: '4 5 6'});
      var positionArray = component.geometry.attributes.position.array;
      assert.equal(positionArray[0], 0);
      assert.equal(positionArray[1], 0);
      assert.equal(positionArray[2], 0);
      assert.equal(positionArray[3], 4);
      assert.equal(positionArray[4], 5);
      assert.equal(positionArray[5], 6);
    });

    test('set end and move it', function () {
      el.setAttribute('line', {end: '4 5 6'});
      var positionArray = component.geometry.attributes.position.array;
      assert.equal(positionArray[0], 0);
      assert.equal(positionArray[1], 0);
      assert.equal(positionArray[2], 0);
      assert.equal(positionArray[3], 4);
      assert.equal(positionArray[4], 5);
      assert.equal(positionArray[5], 6);

      el.setAttribute('line', {end: '7 8 9'});
      assert.equal(positionArray[0], 0);
      assert.equal(positionArray[1], 0);
      assert.equal(positionArray[2], 0);
      assert.equal(positionArray[3], 7);
      assert.equal(positionArray[4], 8);
      assert.equal(positionArray[5], 9);
    });

    test('set end but no start position', function () {
      var end = {x: 4, y: 5, z: 6};
      el.setAttribute('line', {end: end});
      end.z = 9;
      var updateSpy = this.sinon.spy(el.components.line, 'update');
      el.setAttribute('line', {end: end});
      var endPoint = el.getAttribute('line').end;
      assert.equal(endPoint.z, 9);
      assert.ok(updateSpy.called);
    });

    test('modify color', function () {
      el.setAttribute('line', {color: '#f9a'});

      var material = component.material;

      assert.equal(material.color.getHexString(), 'ff99aa');
    });
  });
});
