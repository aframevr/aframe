/* global MessageChannel */
module.exports = function initIframe (scene) {
  if (window.top !== window.self) { return; }

  vrLoaderMode().then(function (isVr) {
    if (isVr) {
      scene.enterVR();
    } else {
      scene.exitVR();
    }
    window.top.postMessage({type: 'ready'}, '*');
  });
};

/**
 * @returns {object} Promise that resolves a boolean whether loader is in VR mode.
 */
function vrLoaderMode () {
  return new Promise(function (resolve) {
    var channel = new MessageChannel();
    window.top.postMessage({type: 'checkVr'}, '*', [channel.port2]);
    channel.port1.onmessage = function (message) {
      resolve(!!message.data.data.isVr);
    };
  });
}
