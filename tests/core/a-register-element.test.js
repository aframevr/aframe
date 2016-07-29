/* global HTMLElement, assert, suite, test */
var AEntity = require('core/a-entity.js');
var ANode = require('core/a-node.js');
var registerElement = require('core/a-register-element').registerElement;
var wrapMethods = require('core/a-register-element').wrapMethods;

suite('a-register-element', function () {
  suite('registerElement', function () {
    test('wraps node createdCallback', function (done) {
      var nodeCreatedSpy = this.sinon.spy(ANode.prototype, 'createdCallback');
      registerElement('a-test-node', {
        prototype: Object.create(ANode.prototype, {
          createdCallback: {
            value: function () {
              assert.ok(nodeCreatedSpy.called);
              done();
            }
          }
        })
      });
      document.createElement('a-test-node');
    });

    test('wraps node attachedCallback', function (done) {
      var nodeAttachedSpy = this.sinon.spy(ANode.prototype, 'attachedCallback');
      registerElement('a-test-node-2', {
        prototype: Object.create(ANode.prototype, {
          attachedCallback: {
            value: function () {
              assert.ok(nodeAttachedSpy.called);
              done();
            }
          }
        })
      });
      document.body.appendChild(document.createElement('a-test-node-2'));
    });

    test('wraps entity createdCallback', function (done) {
      var entityCreatedSpy = this.sinon.spy(AEntity.prototype, 'createdCallback');
      registerElement('a-test-entity', {
        prototype: Object.create(AEntity.prototype, {
          createdCallback: {
            value: function () {
              assert.ok(entityCreatedSpy.called);
              done();
            }
          }
        })
      });
      document.createElement('a-test-entity');
    });

    test('wraps entity attachedCallback', function (done) {
      var entityAttachedSpy = this.sinon.spy(AEntity.prototype, 'attachedCallback');
      registerElement('a-test-entity-2', {
        prototype: Object.create(AEntity.prototype, {
          attachedCallback: {
            value: function () {
              assert.ok(entityAttachedSpy.called);
              done();
            }
          }
        })
      });
      document.body.appendChild(document.createElement('a-test-entity-2'));
    });
  });

  suite('wrapMethods', function () {
    test('wraps to call base prototype method before derived prototype method', function () {
      var BasePrototype;
      var DerivedPrototype;
      var checkIn = [];
      var WrappedDerivedPrototype;

      // Create prototypes;
      BasePrototype = Object.create(HTMLElement.prototype, {
        createdCallback: { value: function () { checkIn.push(0); } }
      });
      DerivedPrototype = Object.create(BasePrototype, {
        createdCallback: { value: function () { checkIn.push(1); } }
      });

      // Wrap.
      WrappedDerivedPrototype = {};
      wrapMethods(WrappedDerivedPrototype, ['createdCallback'], DerivedPrototype,
                  BasePrototype);

      // Check Base (0) before Derived (1).
      WrappedDerivedPrototype.createdCallback.value();
      assert.equal(checkIn[0], 0);
      assert.equal(checkIn[1], 1);
    });
  });
});
