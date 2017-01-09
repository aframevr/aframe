/* global assert, suite, test */
var utils = require('index').utils;

var diff = utils.diff;
var deepEqual = utils.deepEqual;

suite('utils.objects', function () {
  suite('diff', function () {
    test('can diff identical objects', function () {
      var objA = { scale: {x: 1, y: 2, z: 3}, width: 10 };
      var objB = { scale: {x: 1, y: 2, z: 3}, width: 10 };
      assert.shallowDeepEqual(diff(objA, objB), {});
    });

    test('can diff nested objects', function () {
      var objA = { position: {x: 1, y: 2, z: 3} };
      var objB = { position: {x: 4, y: 5, z: 6} };
      assert.shallowDeepEqual(diff(objA, objB), {
        position: objB.position
      });
    });

    test('can diff primitives', function () {
      var objA = {height: 10};
      var objB = {height: 20};
      assert.shallowDeepEqual(diff(objA, objB), {
        height: 20
      });
    });

    test('can diff when key exists in A but not in B', function () {
      var objA = {primitive: 'sphere'};
      var objB = {};
      assert.shallowDeepEqual(diff(objA, objB), {
        primitive: undefined
      });
    });

    test('can diff when key exists in B but not in A', function () {
      var objA = {};
      var objB = {primitive: 'sphere'};
      assert.shallowDeepEqual(diff(objA, objB), {
        primitive: 'sphere'
      });
    });

    test('can cross-diff existing keys', function () {
      var objA = {metallic: 0.5};
      var objB = {roughness: 1};
      assert.shallowDeepEqual(diff(objA, objB), {
        metallic: undefined,
        roughness: 1
      });
    });
  });

  suite('deepEqual', function () {
    test('can compare identical objects', function () {
      var objA = {id: 62, label: 'Foo', parent: null};
      var objB = {id: 62, label: 'Foo', parent: null};
      assert.ok(deepEqual(objA, objB));
    });

    test('can compare for missing properties', function () {
      var objA = {id: 62, label: 'Foo', parent: null};
      var objB = {id: 62, label: 'Foo', parent: null, extraProp: true};
      assert.notOk(deepEqual(objA, objB));
    });

    test('can compare for differing property values', function () {
      var objA = {id: 62, label: 'Foo', parent: null, extraProp: false};
      var objB = {id: 62, label: 'Foo', parent: null, extraProp: true};
      assert.notOk(deepEqual(objA, objB));
    });

    test('can compare nested arrays', function () {
      var objA = {children: [1, 2, 3, 4]};
      var objB = {children: [1, 2, 3, 4]};
      var objC = {children: [1, 2, 3, 5]};
      assert.ok(deepEqual(objA, objB));
      assert.notOk(deepEqual(objA, objC));
    });

    /** SKIPPED: Comparison of nested objects is not yet implemented. */
    test.skip('can compare nested objects', function () {
      var objA = {metadata: {source: 'Wikipedia, 2016'}};
      var objB = {metadata: {source: 'Wikipedia, 2016'}};
      var objC = {metadata: {source: 'Nature, 2015'}};
      assert.ok(deepEqual(objA, objB));
      assert.notOk(deepEqual(objA, objC));
    });
  });
});
