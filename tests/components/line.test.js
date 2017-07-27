/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('line', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('line', '');
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('init', function () {
    test('set start and end position', function () {
      var el = this.el;
      el.setAttribute('line', {start: '1 2 3', end: '4 5 6'});
      var positionArray = el.components.line.geometry.attributes.position.array;
      assert.equal(positionArray[0], 1);
      assert.equal(positionArray[1], 2);
      assert.equal(positionArray[2], 3);
      assert.equal(positionArray[3], 4);
      assert.equal(positionArray[4], 5);
      assert.equal(positionArray[5], 6);
    });

    test('set start but no end position', function () {
      var el = this.el;
      el.setAttribute('line', {start: '1 2 3'});
      var positionArray = el.components.line.geometry.attributes.position.array;
      assert.equal(positionArray[0], 1);
      assert.equal(positionArray[1], 2);
      assert.equal(positionArray[2], 3);
      assert.equal(positionArray[3], 0);
      assert.equal(positionArray[4], 0);
      assert.equal(positionArray[5], 0);
    });

    test('set end but no start position', function () {
      var el = this.el;
      el.setAttribute('line', {end: '4 5 6'});
      var positionArray = el.components.line.geometry.attributes.position.array;
      assert.equal(positionArray[0], 0);
      assert.equal(positionArray[1], 0);
      assert.equal(positionArray[2], 0);
      assert.equal(positionArray[3], 4);
      assert.equal(positionArray[4], 5);
      assert.equal(positionArray[5], 6);
    });

    test('set end and move it', function () {
      var el = this.el;
      el.setAttribute('line', {end: '4 5 6'});
      var positionArray = el.components.line.geometry.attributes.position.array;
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

    test('modify color', function () {
      var el = this.el;
      el.setAttribute('line', {color: '#f9a'});

      var material = el.components.line.material;

      assert.equal(material.color.getHexString(), 'ff99aa');
    });
  });
});
