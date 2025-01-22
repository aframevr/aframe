/* global CustomEvent */

/**
 * Flag indicating if A-Frame can initialize the scene or should wait.
 */
export var canInitializeElements = false;

/**
 * Waits for the document to be ready.
 */
export function waitForDocumentReadyState () {
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

/**
 * Signals A-Frame that everything is ready to initialize.
 */
export function emitReady () {
  if (canInitializeElements) { return; }
  canInitializeElements = true;
  setTimeout(function () {
    document.dispatchEvent(new CustomEvent('aframeready'));
  });
}

/** Resets the canInitializeElements flag, used for testing */
export function reset () {
  canInitializeElements = false;
}
