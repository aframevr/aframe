/* global assert, setup, suite, test */
var helpers = require('../helpers');
var entity = require('utils/').entity;

var getComponentProperty = entity.getComponentProperty;
var setComponentProperty = entity.setComponentProperty;

suite('utils.entity', function () {
  setup(function (done) {
    var el = this.el = helpers.entityFactory();
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('getComponentProperty', function () {
    test('can get normal attribute', function () {
      var el = this.el;
      el.setAttribute('visible', true);
      assert.equal(getComponentProperty(el, 'visible'), true);
    });

    test('can get dot-delimited attribute', function () {
      var el = this.el;
      el.setAttribute('material', {color: 'red'});
      assert.equal(getComponentProperty(el, 'material.color'), 'red');
    });

    test('can get custom-delimited attribute', function () {
      var el = this.el;
      el.setAttribute('material', {color: 'red'});
      assert.equal(getComponentProperty(el, 'material|color', '|'), 'red');
    });
  });

  suite('setComponentProperty', function () {
    test('can set normal attribute', function () {
      var el = this.el;
      setComponentProperty(el, 'visible', true);
      assert.equal(el.getAttribute('visible'), true);
    });

    test('can set dot-delimited attribute', function () {
      var el = this.el;
      setComponentProperty(el, 'material.color', 'red');
      assert.equal(el.getAttribute('material').color, 'red');
    });

    test('can get custom-delimited attribute', function () {
      var el = this.el;
      setComponentProperty(el, 'material|color', 'red', '|');
      assert.equal(el.getAttribute('material').color, 'red');
    });
  });
});
