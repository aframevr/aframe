/* global assert, setup, suite, test */

suite('a-node', function () {
  setup(function () {
    this.el = document.createElement('a-node');
  });

  suite('emit', function () {
    test('can emit event', function (done) {
      var el = this.el;
      el.addEventListener('hadouken', function () {
        done();
      });
      el.emit('hadouken');
    });

    test('can emit event with detail', function (done) {
      var el = this.el;
      el.addEventListener('hadouken', function (event) {
        assert.equal(event.detail.power, 10);
        assert.equal(event.target, el);
        done();
      });
      el.emit('hadouken', {power: 10});
    });

    test('does not leak detail between events', function (done) {
      var el = this.el;
      el.addEventListener('foo', function (evt) {
        setTimeout(() => {
          assert.equal(evt.detail.foo, 10);
          assert.notOk('bar' in evt.detail);
          done();
        });
      });

      el.emit('foo', {foo: 10});
      el.emit('bar', {bar: 20});
    });

    test('can emit event with extraData', function (done) {
      var el = this.el;
      el.addEventListener('hadouken', function (event) {
        assert.equal(event.cancelable, true);
        assert.equal(event.detail.power, 10);
        assert.equal(event.target, el);
        done();
      });
      el.emit('hadouken', {power: 10}, true, {cancelable: true});
    });

    test('bubbles', function (done) {
      var el = this.el;
      var child = document.createElement('a-node');
      el.appendChild(child);
      el.addEventListener('hadouken', function (event) {
        done();
      });
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
      setTimeout(function () {
        done();
      }, 50);
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
      el.load();
      el.addEventListener('loaded', function () {
        done();
      });
    });

    test('sets hasLoaded', function (done) {
      var el = this.el;
      assert.notOk(el.hasLoaded);
      el.load();
      el.addEventListener('loaded', function () {
        assert.ok(el.hasLoaded);
        done();
      });
    });

    test('can load with a child node', function (done) {
      var el = this.el;
      var child = document.createElement('a-node');
      el.appendChild(child);
      child.load();
      el.load();
      el.addEventListener('loaded', function () {
        done();
      });
    });

    test('can load with a callback', function (done) {
      this.el.load(function () {
        done();
      });
    });

    test('does not wait for non-nodes to load', function (done) {
      var el = this.el;
      var a = document.createElement('a');
      el.appendChild(a);
      el.load();
      el.addEventListener('loaded', function () {
        done();
      });
    });
  });
});
