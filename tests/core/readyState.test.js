/* global assert, suite, test, setup */
import * as readyState from 'core/readyState.js';

suite('readyState', function () {
  setup(function (done) {
    // Test setup initializes AFRAME when document is already ready.
    // This timeout ensures the readyState is reset before running the tests here.
    setTimeout(function () {
      readyState.reset();
      done();
    });
  });

  suite('waitForDocumentReadyState', function () {
    test('emits aframeready when document is ready', function (done) {
      var listenerSpy = this.sinon.spy();
      document.addEventListener('aframeready', listenerSpy);

      assert.equal(document.readyState, 'complete');
      readyState.waitForDocumentReadyState();

      setTimeout(function () {
        assert.ok(listenerSpy.calledOnce);
        done();
      });
    });
  });

  suite('emitReady', function () {
    test('emits aframeready', function (done) {
      var listenerSpy = this.sinon.spy();
      document.addEventListener('aframeready', listenerSpy);

      assert.ok(listenerSpy.notCalled);
      readyState.emitReady();

      setTimeout(function () {
        assert.ok(listenerSpy.calledOnce);
        assert.ok(readyState.canInitializeElements);
        done();
      });
    });

    test('emits aframeready event only once', function (done) {
      var listenerSpy = this.sinon.spy();
      document.addEventListener('aframeready', listenerSpy);

      assert.ok(listenerSpy.notCalled);
      // Calling emitReady multiple times should result in only one event being emitted.
      readyState.emitReady();
      readyState.emitReady();

      setTimeout(function () {
        assert.ok(listenerSpy.calledOnce);
        assert.ok(readyState.canInitializeElements);

        // Calling again after the event fired should not emit.
        readyState.emitReady();
        setTimeout(function () {
          // Assert total count is still only once.
          assert.ok(listenerSpy.calledOnce);
          assert.ok(readyState.canInitializeElements);
          done();
        });
      });
    });
  });
});
