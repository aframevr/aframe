/* global assert, setup, suite, test */
let helpers = require('../helpers');
let entity = require('utils/').entity;

let getComponentProperty = entity.getComponentProperty;
let setComponentProperty = entity.setComponentProperty;

suite('utils.entity', function () {
  setup(function (done) {
    let el = this.el = helpers.entityFactory();
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('getComponentProperty', function () {
    test('can get normal attribute', function () {
      let el = this.el;
      el.setAttribute('visible', true);
      assert.equal(getComponentProperty(el, 'visible'), true);
    });

    test('can get dot-delimited attribute', function () {
      let el = this.el;
      el.setAttribute('material', {color: 'red'});
      assert.equal(getComponentProperty(el, 'material.color'), 'red');
      assert.equal(entity.propertyPathCache['.']['material.color'][0], 'material');
      assert.equal(entity.propertyPathCache['.']['material.color'][1], 'color');
    });

    test('can get custom-delimited attribute', function () {
      let el = this.el;
      el.setAttribute('material', {color: 'red'});
      assert.equal(getComponentProperty(el, 'material|color', '|'), 'red');
      assert.equal(entity.propertyPathCache['|']['material|color'][0], 'material');
      assert.equal(entity.propertyPathCache['|']['material|color'][1], 'color');
    });
  });

  suite('setComponentProperty', function () {
    test('can set normal attribute', function () {
      let el = this.el;
      setComponentProperty(el, 'visible', true);
      assert.equal(el.getAttribute('visible'), true);
    });

    test('can set dot-delimited attribute', function () {
      let el = this.el;
      setComponentProperty(el, 'material.color', 'red');
      assert.equal(el.getAttribute('material').color, 'red');
    });

    test('can get custom-delimited attribute', function () {
      let el = this.el;
      setComponentProperty(el, 'material|color', 'red', '|');
      assert.equal(el.getAttribute('material').color, 'red');
    });
  });
});
