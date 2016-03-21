module.exports = function initMetaTags (scene) {
  if (!scene.isMobile) { return; }
  injectMetaTags();
};

/**
 * Injects the necessary metatags in the document for mobile support to:
 * 1. Prevent the user to zoom in the document
 * 2. Ensure that window.innerWidth and window.innerHeight have the correct
 *    values and the canvas is properly scaled
 * 3. To allow fullscreen mode when pinning a web app on the home screen on
 *    iOS.
 * Adapted from: https://www.reddit.com/r/web_design/comments/3la04p/
 *
 * @type {Object}
 */
function injectMetaTags () {
  var headEl;
  var meta = document.querySelector('meta[name="viewport"]');
  var metaTags = [];

  if (meta) { return; }

  headEl = document.getElementsByTagName('head')[0];
  meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content =
    'width=device-width,initial-scale=1,shrink-to-fit=no,user-scalable=no,maximum-scale=1';
  headEl.appendChild(meta);
  metaTags.push(meta);

  // iOS-specific meta tags for fullscreen when pinning to homescreen.
  meta = document.createElement('meta');
  meta.name = 'apple-mobile-web-app-capable';
  meta.content = 'yes';
  headEl.appendChild(meta);
  metaTags.push(meta);

  meta = document.createElement('meta');
  meta.name = 'apple-mobile-web-app-status-bar-style';
  meta.content = 'black';
  headEl.appendChild(meta);
  metaTags.push(meta);

  return metaTags;
}
