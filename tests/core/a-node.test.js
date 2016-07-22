/* global assert, setup, suite, test */

suite('a-node', function () {
  setup(function () {
    var el = this.el = document.createElement('a-node');
    el.setAttribute('id', 'rootNode');
  });

  suite('attach', function () {
    test('isNode', function () {
      assert.ok(this.el.isNode);
    });

    test('emits nodeready', function (done) {
      var el = this.el;
      assert.notOk(el.isNodeReady);
      el.addEventListener('nodeready', function () {
        assert.ok(el.isNodeReady);
        el.parentNode.removeChild(el);
        done();
      });
      document.body.appendChild(el);
    });
  });

  suite('emit', function () {
    test('can emit event', function (done) {
      var el = this.el;
      el.addEventListener('hadouken', function () { done(); });
      el.emit('hadouken');
    });

    test('can emit event with detail', function (done) {
      var el = this.el;
      el.addEventListener('hadouken', function (event) {
        assert.equal(event.detail.power, 10);
        assert.equal(event.detail.target, el);
        done();
      });
      el.emit('hadouken', { power: 10 });
    });

    test('bubbles', function (done) {
      var el = this.el;
      var child = document.createElement('a-node');
      el.appendChild(child);
      el.addEventListener('hadouken', function (event) { done(); });
      child.emit('hadouken', {}, true);
    });

    test('can disable bubble', function (done) {
      var el = this.el;
      var child = document.createElement('a-node');
      el.appendChild(child);
      el.addEventListener('hadouken', function (event) {
        // Failure case.
        assert.equal(1, 2);
        done();
      });
      child.emit('hadouken', {}, false);
      setTimeout(done, 50);
    });
  });

  suite('getChildren', function () {
    test('returns all children', function () {
      var el = this.el;
      var child1 = document.createElement('a-node');
      var child2 = document.createElement('a');
      var child3 = document.createElement('a-entity');
      var nestedChild = document.createElement('a-node');
      child1.appendChild(nestedChild);
      el.appendChild(child1);
      el.appendChild(child2);
      el.appendChild(child3);
      assert.deepEqual(el.getChildren(), [
        child1, child2, child3
      ]);
    });
  });

  suite('load', function () {
    test('can load when empty', function (done) {
      var el = this.el;
      el.addEventListener('loaded', function () { done(); });
      el.load();
    });

    test('sets hasLoaded', function (done) {
      var el = this.el;
      assert.notOk(el.hasLoaded);
      el.addEventListener('loaded', function () {
        assert.ok(el.hasLoaded);
        done();
      });
      el.load();
    });

    test('can load with a child node, child calls loads first', function (done) {
      var el = this.el;
      var child = document.createElement('a-node');

      document.body.appendChild(el);
      el.appendChild(child);

      el.addEventListener('loaded', function () {
        assert.ok(child.hasLoaded);
        assert.ok(child.isNodeReady);
        el.parentNode.removeChild(el);
        done();
      });

      process.nextTick(function () {
        child.load();
        el.load();
      });
    });

    test('can load with a child node, parent calls loads first', function (done) {
      var el = this.el;
      var child = document.createElement('a-node');

      document.body.appendChild(el);
      el.appendChild(child);

      el.addEventListener('loaded', function () {
        assert.ok(child.hasLoaded);
        assert.ok(child.isNodeReady);
        el.parentNode.removeChild(el);
        done();
      });

      process.nextTick(function () {
        el.load();
        child.load();
      });
    });

    test('can load with a callback', function (done) {
      this.el.load(function () { done(); });
    });

    test('can specify filter to not wait for non-nodes', function (done) {
      var el = this.el;
      var a = document.createElement('a');
      el.appendChild(a);
      el.addEventListener('loaded', function () { done(); });
      el.load(null, null, function (el) { return el.tagName !== 'A'; });
    });
  });
});
