/* global assert, suite, test */
var solveOrder = require('utils/order').solveOrder;

suite('utils.order', function () {
  test('empty order when ordering 0 nodes', function () {
    var actual = solveOrder({});
    assert.deepEqual(actual, []);
  });

  test('retains order when no constraints are given', function () {
    var actual = solveOrder({a: {}, b: {}, c: {}});
    assert.deepEqual(actual, ['a', 'b', 'c']);
  });

  test('honors before constraint', function () {
    var actual = solveOrder({a: {}, b: {}, c: { before: ['a'] }});
    assert.sameMembers(actual, ['a', 'b', 'c']);
    assert.ok(actual.indexOf('c') < actual.indexOf('a'));
  });

  test('honors after constraint', function () {
    var actual = solveOrder({a: { after: ['c'] }, b: {}, c: {}});
    assert.sameMembers(actual, ['a', 'b', 'c']);
    assert.ok(actual.indexOf('a') > actual.indexOf('c'));
  });

  test('breaks cycles, while retaining all elements', function () {
    var actual = solveOrder({a: { after: ['c'] }, b: {}, c: { after: ['a'] }});
    assert.sameMembers(actual, ['a', 'b', 'c']);
  });

  test('handles chain of before constraints', function () {
    var actual = solveOrder({
      d: { },
      c: { before: ['d'] },
      b: { before: ['c'] },
      a: { before: ['b'] }
    });
    assert.deepEqual(actual, ['a', 'b', 'c', 'd']);
  });

  test('handles chain of after constraints', function () {
    var actual = solveOrder({
      a: { after: ['b'] },
      b: { after: ['c'] },
      c: { after: ['d'] },
      d: { }
    });
    assert.deepEqual(actual, ['d', 'c', 'b', 'a']);
  });

  test('handles multiple after constraints', function () {
    var actual = solveOrder({
      a: { after: ['b', 'c', 'd'] },
      b: { },
      c: { after: ['d', 'b'] },
      d: { }
    });
    assert.sameMembers(actual, ['a', 'b', 'c', 'd']);
    assert.equal(actual.indexOf('a'), 3);
    assert.equal(actual.indexOf('c'), 2);
  });

  test('handles multiple before constraints', function () {
    var actual = solveOrder({
      a: { },
      b: { before: ['a', 'c'] },
      c: { },
      d: { before: ['a', 'b', 'c']}
    });
    assert.sameMembers(actual, ['a', 'b', 'c', 'd']);
    assert.equal(actual.indexOf('b'), 1);
    assert.equal(actual.indexOf('d'), 0);
  });

  test('handles graph of before/after constraints', function () {
    // The following graph is modelled in constraints.
    // Arrows indicate a before relationship. Some constraints
    // are modelled as before, others as after and a few as both.
    //
    // a -> b -> c -> d
    //   \      /
    //    e -> f -> g
    //    v         ^
    //    h -> i -> j -> k
    // l
    var actual = solveOrder({
      a: { before: ['e', 'b'], after: [] },
      b: { before: [], after: [] },
      c: { before: ['d'], after: ['b', 'f'] },
      d: { before: [], after: [] },
      e: { before: [], after: [] },
      f: { before: ['g'], after: ['e'] },
      g: { before: [], after: ['f'] },
      h: { before: ['i'], after: ['e'] },
      i: { before: ['j'], after: [] },
      j: { before: ['g'], after: ['i'] },
      k: { before: [], after: ['j'] },
      l: { before: [], after: [] }
    });
    assert.sameMembers(actual, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']);
    // Verify all provided constraints.
    assert.ok(actual.indexOf('a') < actual.indexOf('e'));
    assert.ok(actual.indexOf('a') < actual.indexOf('b'));
    assert.ok(actual.indexOf('c') < actual.indexOf('d'));
    assert.ok(actual.indexOf('c') > actual.indexOf('b'));
    assert.ok(actual.indexOf('c') > actual.indexOf('f'));
    assert.ok(actual.indexOf('f') < actual.indexOf('g'));
    assert.ok(actual.indexOf('f') > actual.indexOf('e'));
    assert.ok(actual.indexOf('g') > actual.indexOf('f'));
    assert.ok(actual.indexOf('h') < actual.indexOf('i'));
    assert.ok(actual.indexOf('h') > actual.indexOf('e'));
    assert.ok(actual.indexOf('i') < actual.indexOf('j'));
    assert.ok(actual.indexOf('j') < actual.indexOf('g'));
    assert.ok(actual.indexOf('j') > actual.indexOf('i'));
    assert.ok(actual.indexOf('k') > actual.indexOf('j'));
  });
});
