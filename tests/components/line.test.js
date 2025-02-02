/* global THREE, assert, setup, suite, test */
import { entityFactory } from '../helpers.js';

suite('line', function () {
  var el;
  var component;
  var componentSuffix;

  setup(function (done) {
    var count = 0;
    el = this.el = entityFactory();
    el.addEventListener('componentinitialized', function (evt) {
      if (evt.detail.name !== 'line' &&
          evt.detail.name !== 'line__suffix') { return; }
      component = el.components.line;
      componentSuffix = el.components.line__suffix;
      count++;
      if (count >= 2) {
        done();
      }
    });
    el.setAttribute('line', '');
    el.setAttribute('line__suffix', '');
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

    test('Line with __suffix component name', function () {
      el.setAttribute('line__suffix', {start: '1 2 3', end: '4 5 6'});
      var positionArray = componentSuffix.geometry.attributes.position.array;
      assert.equal(positionArray[0], 1);
      assert.equal(positionArray[1], 2);
      assert.equal(positionArray[2], 3);
      assert.equal(positionArray[3], 4);
      assert.equal(positionArray[4], 5);
      assert.equal(positionArray[5], 6);
    });
  });

  suite('update', function () {
    test('points can be updated with the same instance', function () {
      var start = new THREE.Vector3(1, 2, 3);
      el.setAttribute('line', {start: start});
      var updateSpy = this.sinon.spy(el.components.line, 'update');

      var data = el.getAttribute('line');
      assert.shallowDeepEqual(data.start, {x: 1, y: 2, z: 3});

      start.x += 10;
      el.setAttribute('line', {start: start});

      assert.shallowDeepEqual(data.start, {x: 11, y: 2, z: 3});
      assert.ok(updateSpy.calledOnce);
    });
  });
});
