/* global assert, suite, test */
let utils = require('index').utils;

let diff = utils.diff;
let deepEqual = utils.deepEqual;

suite('utils.objects', function () {
  suite('diff', function () {
    test('can diff identical objects', function () {
      let objA = { scale: {x: 1, y: 2, z: 3}, width: 10 };
      let objB = { scale: {x: 1, y: 2, z: 3}, width: 10 };
      assert.shallowDeepEqual(diff(objA, objB), {});
    });

    test('can diff nested objects', function () {
      let objA = { position: {x: 1, y: 2, z: 3} };
      let objB = { position: {x: 4, y: 5, z: 6} };
      assert.shallowDeepEqual(diff(objA, objB), {
        position: objB.position
      });
    });

    test('can diff primitives', function () {
      let objA = {height: 10};
      let objB = {height: 20};
      assert.shallowDeepEqual(diff(objA, objB), {
        height: 20
      });
    });

    test('can diff when key exists in A but not in B', function () {
      let objA = {primitive: 'sphere'};
      let objB = {};
      assert.shallowDeepEqual(diff(objA, objB), {
        primitive: undefined
      });
    });

    test('can diff when key exists in B but not in A', function () {
      let objA = {};
      let objB = {primitive: 'sphere'};
      assert.shallowDeepEqual(diff(objA, objB), {
        primitive: 'sphere'
      });
    });

    test('can cross-diff existing keys', function () {
      let objA = {metallic: 0.5};
      let objB = {roughness: 1};
      assert.shallowDeepEqual(diff(objA, objB), {
        metallic: undefined,
        roughness: 1
      });
    });
  });

  suite('deepEqual', function () {
    test('can compare identical objects', function () {
      let objA = {id: 62, label: 'Foo', parent: null};
      let objB = {id: 62, label: 'Foo', parent: null};
      assert.ok(deepEqual(objA, objB));
    });

    test('can compare strings', function () {
      let valA = 'abc';
      let valB = 'abc';
      let valC = 'def';
      assert.ok(deepEqual(valA, valB));
      assert.notOk(deepEqual(valA, valC));
    });

    test('can compare numbers', function () {
      let valA = 1;
      let valB = 1;
      let valC = 2;
      assert.ok(deepEqual(valA, valB));
      assert.notOk(deepEqual(valA, valC));
    });

    test('can compare for missing properties', function () {
      let objA = {id: 62, label: 'Foo', parent: null};
      let objB = {id: 62, label: 'Foo', parent: null, extraProp: true};
      assert.notOk(deepEqual(objA, objB));
    });

    test('can compare for differing property values', function () {
      let objA = {id: 62, label: 'Foo', parent: null, extraProp: false};
      let objB = {id: 62, label: 'Foo', parent: null, extraProp: true};
      assert.notOk(deepEqual(objA, objB));
    });

    test('can compare nested arrays', function () {
      let objA = {children: [1, 2, 3, 4]};
      let objB = {children: [1, 2, 3, 4]};
      let objC = {children: [1, 2, 3, 5]};
      assert.ok(deepEqual(objA, objB));
      assert.notOk(deepEqual(objA, objC));
    });

    test('can compare nested objects', function () {
      let objA = {metadata: {source: 'Wikipedia, 2016'}};
      let objB = {metadata: {source: 'Wikipedia, 2016'}};
      let objC = {metadata: {source: 'Nature, 2015'}};
      assert.ok(deepEqual(objA, objB));
      assert.notOk(deepEqual(objA, objC));
    });

    test('can compare vec3s', function () {
      let objA = {x: 0, y: 0, z: 0};
      let objB = {x: 0, y: 0, z: 0};
      let objC = {x: 1, y: 2, z: 3};
      assert.ok(deepEqual(objA, objB));
      assert.notOk(deepEqual(objA, objC));
    });

    test('can compare with null', function () {
      assert.ok(deepEqual(null, null));
      assert.notOk(deepEqual(null, {}));
    });

    test('can compare empty objects', function () {
      assert.ok(deepEqual({}, {}));
      assert.notOk(deepEqual({}, {a: 1}));
    });

    test('can compare the same object with self reference', function () {
      let objA = {x: 0, y: 0, z: 0};
      objA.self = objA;
      assert.ok(deepEqual(objA, objA));
    });

    test('avoid deep equal of object that are not instantiated' +
         'with the Object constructor in order to avoid infinite loops', function () {
      assert.notOk(deepEqual(document.createElement('a-entity'),
                             document.createElement('a-entity')));
    });

    test('can compare if any of the arguments is undefined', function () {
      assert.notOk(deepEqual(undefined, {a: 1, b: 2}));
      assert.notOk(deepEqual({a: 1, b: 2}, undefined));
      assert.ok(deepEqual(undefined, undefined));
    });
  });
});
