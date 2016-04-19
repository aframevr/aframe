/* global assert, process, teardown, suite, test */
'use strict';
var components = require('core/component').components;
var registerControls = require('core/controls').registerControls;
var controls = require('core/controls').controls;
var systems = require('core/system').systems;

suite('core/controls', function () {
  suite('controls system', function () {
    test('is registered', function () {
      assert.ok('controls' in systems);
    });
  });

  suite('controls registration', function () {
    teardown(function () {
      delete controls.positionControls.test;
      delete controls.rotationControls.test;
      delete components.test;
    });

    test('can register position controls', function () {
      assert.notOk('test' in controls.positionControls);
      assert.notOk('test' in controls.rotationControls);
      registerControls('test', {
        isVelocityActive: function () {},
        getVelocityDelta: function () {}
      });
      assert.ok('test' in controls.positionControls);
      assert.notOk('test' in controls.rotationControls);
    });

    test('can register rotation controls', function () {
      assert.notOk('test' in controls.positionControls);
      assert.notOk('test' in controls.rotationControls);
      registerControls('test', {
        isRotationActive: function () {},
        getRotationDelta: function () {}
      });
      assert.notOk('test' in controls.positionControls);
      assert.ok('test' in controls.rotationControls);
    });

    test('can register position+rotation controls', function () {
      assert.notOk('test' in controls.positionControls);
      assert.notOk('test' in controls.rotationControls);
      registerControls('test', {
        isVelocityActive: function () {},
        getVelocityDelta: function () {},
        isRotationActive: function () {},
        getRotationDelta: function () {}
      });
      assert.ok('test' in controls.positionControls);
      assert.ok('test' in controls.rotationControls);
    });

    test('cannot register noop controls', function () {
      assert.notOk('test' in controls.positionControls);
      assert.notOk('test' in controls.rotationControls);
      assert.throws(function () {
        registerControls('test', { noop: function () {} });
      });
      assert.notOk('test' in controls.positionControls);
      assert.notOk('test' in controls.rotationControls);
    });
  });
});
