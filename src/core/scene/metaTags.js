var constants = require('../../constants/');
var extend = require('../../utils').extend;

var MOBILE_HEAD_TAGS = module.exports.MOBILE_HEAD_TAGS = [
  Meta({name: 'viewport', content: 'width=device-width,initial-scale=1,maximum-scale=1,shrink-to-fit=no,user-scalable=no,minimal-ui,viewport-fit=cover'}),

  // W3C-standardised meta tags.
  Meta({name: 'mobile-web-app-capable', content: 'yes'}),
  Meta({name: 'theme-color', content: 'black'})
];

var MOBILE_IOS_HEAD_TAGS = [
  // iOS-specific meta tags for fullscreen when pinning to homescreen.
  Meta({name: 'apple-mobile-web-app-capable', content: 'yes'}),
  Meta({name: 'apple-mobile-web-app-status-bar-style', content: 'black'}),
  Link({rel: 'apple-touch-icon', href: 'https://aframe.io/images/aframe-logo-152.png'})
];

function Meta (attrs) {
  return {
    tagName: 'meta',
    attributes: attrs,
    exists: function () { return document.querySelector('meta[name="' + attrs.name + '"]'); }
  };
}

function Link (attrs) {
  return {
    tagName: 'link',
    attributes: attrs,
    exists: function () { return document.querySelector('link[rel="' + attrs.rel + '"]'); }
  };
}

/**
 * Injects the necessary metatags in the document for mobile support:
 * 1. Prevent the user to zoom in the document.
 * 2. Ensure that window.innerWidth and window.innerHeight have the correct
 *    values and the canvas is properly scaled.
 * 3. To allow fullscreen mode when pinning a web app on the home screen on
 *    iOS.
 * Adapted from https://www.reddit.com/r/web_design/comments/3la04p/
 *
 * @param {object} scene - Scene element
 * @returns {Array}
 */
module.exports.inject = function injectHeadTags (scene) {
  var headEl = document.head;
  var headScriptEl = headEl.querySelector('script');
  var tag;
  var headTags = [];
  MOBILE_HEAD_TAGS.forEach(createAndInjectTag);
  if (scene.isIOS) {
    MOBILE_IOS_HEAD_TAGS.forEach(createAndInjectTag);
  }
  return headTags;

  function createAndInjectTag (tagObj) {
    if (!tagObj || tagObj.exists()) { return; }

    tag = createTag(tagObj);
    if (!tag) { return; }

    if (headScriptEl) {
      headScriptEl.parentNode.insertBefore(tag, headScriptEl);
    } else {
      headEl.appendChild(tag);
    }

    headTags.push(tag);
  }
};

function createTag (tagObj) {
  if (!tagObj || !tagObj.tagName) { return; }
  var meta = document.createElement(tagObj.tagName);
  meta.setAttribute(constants.AFRAME_INJECTED, '');
  return extend(meta, tagObj.attributes);
}
