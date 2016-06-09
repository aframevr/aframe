/**
 * Provides a postMessage API for manipulating a scene from within
 * from an iframe, a webview, or within the document itself.
 */
var SCENE_TIMEOUT = 30000;  // 30 seconds.

module.exports = function initPostMessageAPI (scene) {
  var timeout = setTimeout(function () {
    var err = new Error('Scene timeout after ' + SCENE_TIMEOUT + ' ms');
    postMsgEvent('scene-load', scene, err);
  }, SCENE_TIMEOUT);
  scene.addEventListener('loaded', function () {
    // postMessage API handler for this specific scene.
    window.addEventListener('message', postMessageAPIHandler.bind(scene));
    postMsgEvent('scene-load', scene);
    clearTimeout(timeout);
  });
  var eventHandler = postMsgEvent.bind(scene);
  scene.addEventListener('enter-vr', eventHandler);
  scene.addEventListener('enter-vr-error', eventHandler);
  scene.addEventListener('exit-vr', eventHandler);
  scene.addEventListener('exit-vr-error', eventHandler);
};

function postMsg (type, data, origin) {
  // console.log(data);
  // HELP:
  // Try this in your Dev Tools' Console:
  //
  //   >> window.postMessage({type: 'aframe-scene', data: 'enter-vr'}, '*')
  //   << postMessage.js:27 Uncaught DataCloneError: Failed to execute 'postMessage' on 'Window': An object could not be cloned.
  //
  // I can't clone DOM elements and `postMessage` those.
  // So what should I send back as an identifier for the scene?
  // Should we create unique `id`s for each `<a-scene>`?
  return window.top.postMessage({
    type: type,
    data: data
  }, origin || '*');
}

function postMsgEvent (event) {
  event = event || {};
  event.sceneEl = this;
  return postMsg('aframe-event', event);
}

function postMessageAPIHandler (event) {
  var scene = this;
  var eventData = event.data;
  if (!eventData) { return; }
  var targetScene = eventData.sceneEl;
  if (targetScene) {
    // Compare elements (and try querying by CSS selector).
    if (scene !== targetScene ||
        (typeof targetScene === 'string' && !scene.matches(targetScene))) {
      return false;
    }
  }
  switch (eventData.type) {
    case 'aframe-scene': {
      switch (eventData.data) {
        case 'enter-vr':
          scene.enterVR().catch(console.error.bind(console));
          break;
        case 'exit-vr':
          scene.exitVR().catch(console.error.bind(console));
          break;
      }
    }
  }
}
