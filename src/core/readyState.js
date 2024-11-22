/* global CustomEvent */

/**
 * Flag indicating if A-Frame can initialize the scene or should wait.
 */
module.exports.canInitializeElements = false;

/**
 * Waits for the document to be ready.
 */
function waitForDocumentReadyState () {
  if (document.readyState === 'complete') {
    emitReady();
    return;
  }

  document.addEventListener('readystatechange', function onReadyStateChange () {
    if (document.readyState !== 'complete') { return; }
    document.removeEventListener('readystatechange', onReadyStateChange);
    emitReady();
  });
}
module.exports.waitForDocumentReadyState = waitForDocumentReadyState;

/**
 * Signals A-Frame that everything is ready to initialize.
 */
function emitReady () {
  if (module.exports.canInitializeElements) { return; }
  module.exports.canInitializeElements = true;
  setTimeout(function () {
    document.dispatchEvent(new CustomEvent('aframeready'));
  });
}
module.exports.emitReady = emitReady;
