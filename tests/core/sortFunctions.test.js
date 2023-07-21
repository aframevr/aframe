/* global assert, process, suite, test, setup */

var {aframeSortOpaqueDefault, aframeSortTransparentDefault, aframeSortTransparentSpatial} = require('core/scene/sortFunctions');

suite('sortFunctions', function () {
  var objects;
  var objectsRenderOrder;
  var objectsGroupOrder;

  setup(function () {
    objects = [
      { name: 'a', renderOrder: 0, z: 1 },
      { name: 'b', renderOrder: 0, z: 3 },
      { name: 'c', renderOrder: 0, z: 2 }
    ];

    objectsRenderOrder = [
      { name: 'a', renderOrder: 1, z: 1 },
      { name: 'b', renderOrder: 0, z: 3 },
      { name: 'c', renderOrder: -1, z: 2 }
    ];

    objectsGroupOrder = [
      { name: 'a', groupOrder: 0, renderOrder: 1, z: 1 },
      { name: 'b', groupOrder: 0, renderOrder: 0, z: 3 },
      { name: 'c', groupOrder: 1, renderOrder: -1, z: 2 }
    ];
  });

  function checkOrder (objects, array) {
    array.forEach((item, index) => {
      assert.equal(objects[index].name, item);
    });
  }

  test('Opaque sort sorts front-to-back', function () {
    objects.sort(aframeSortOpaqueDefault);
    checkOrder(objects, ['a', 'c', 'b']);
  });

  test('Opaque sort respects renderOrder', function () {
    objectsRenderOrder.sort(aframeSortOpaqueDefault);
    checkOrder(objectsRenderOrder, ['c', 'b', 'a']);
  });

  test('Opaque sort respects groupOrder, then renderOrder', function () {
    objectsGroupOrder.sort(aframeSortOpaqueDefault);
    checkOrder(objectsGroupOrder, ['b', 'a', 'c']);
  });

  test('Transparent default sort sorts in DOM order', function () {
    objects.sort(aframeSortTransparentDefault);
    checkOrder(objects, ['a', 'b', 'c']);
  });

  test('Transparent default sort respects renderOrder', function () {
    objectsRenderOrder.sort(aframeSortTransparentDefault);
    checkOrder(objectsRenderOrder, ['c', 'b', 'a']);
  });

  test('Transparent default sort respects groupOrder, then renderOrder', function () {
    objectsGroupOrder.sort(aframeSortTransparentDefault);
    checkOrder(objectsGroupOrder, ['b', 'a', 'c']);
  });

  test('Transparent spatial sort sorts back-to-front', function () {
    objects.sort(aframeSortTransparentSpatial);
    checkOrder(objects, ['b', 'c', 'a']);
  });

  test('Transparent spatial sort respects renderOrder', function () {
    objectsRenderOrder.sort(aframeSortTransparentSpatial);
    checkOrder(objectsRenderOrder, ['c', 'b', 'a']);
  });

  test('Transparent spatial sort respects groupOrder, then renderOrder', function () {
    objectsGroupOrder.sort(aframeSortTransparentSpatial);
    checkOrder(objectsGroupOrder, ['b', 'a', 'c']);
  });
});
