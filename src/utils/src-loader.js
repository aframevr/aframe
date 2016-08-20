/* global Image */
var debug = require('./debug');

var warn = debug('utils:src-loader:warn');

/**
 * Validates a texture, either as a selector or as a URL.
 * Detects whether `src` is pointing to an image, video, or canvas, and invokes the
 * appropriate callback.
 *
 * If `src` is selector, check if it's valid, return the el in the callback.
 * An el is returned so that it can be reused for texture loading.
 *
 * If `src` is a URL, check if it's valid, return the src in the callback.
 *
 * @params {string} src - A selector or a URL. URLs must be wrapped by `url()`.
 * @params {function} isImageCb - callback if texture is an image.
 * @params {function} isVideoCb - callback if texture is a video.
 * @params {function} isCanvasCb - callback if texture is a canvas.
 */
function validateSrc (src, isImageCb, isVideoCb, isCanvasCb) {
  var textureEl;
  var isImage;
  var isVideo;
  var isCanvas;
  var url = parseUrl(src);

  // src is a url.
  if (url) {
    validateImageUrl(url, function isAnImageUrl (isImage) {
      if (!isImage) { isVideoCb(url); return; }
      isImageCb(url);
    });
    return;
  }

  // src is a query selector.
  textureEl = validateAndGetQuerySelector(src);
  if (!textureEl) { return; }
  isImage = textureEl && textureEl.tagName === 'IMG';
  isVideo = textureEl && textureEl.tagName === 'VIDEO';
  isCanvas = textureEl && textureEl.tagName === 'CANVAS';
  if (isImage) { return isImageCb(textureEl); }
  if (isVideo) { return isVideoCb(textureEl); }
  if (isCanvas) { return isCanvasCb(textureEl); }

  // src is a valid selector but doesn't match with a <img>, <video>, or <canvas> element.
  warn('"%s" does not point to a valid <img>, <video>, or <canvas> element', src);
}

/**
 * Validates six images as a cubemap, either as selector or comma-separated
 * URLs.
 *
 * @param {string} src - A selector or comma-separated image URLs. Image URLs
          must be wrapped by `url()`.
 * @param {string} src - A selector or comma-separated image URLs. Image URLs
          must be wrapped by `url()`.
 */
function validateCubemapSrc (src, cb) {
  var aCubemap;
  var cubemapSrcRegex = '';
  var i;
  var urls;
  var validatedUrls = [];

  for (i = 0; i < 5; i++) {
    cubemapSrcRegex += '(url\\((?:[^\\)]+)\\),\\s*)';
  }
  cubemapSrcRegex += '(url\\((?:[^\\)]+)\\)\\s*)';
  urls = src.match(new RegExp(cubemapSrcRegex));

  // `src` is a comma-separated list of URLs.
  // In this case, re-use validateSrc for each side of the cube.
  function isImageCb (url) {
    validatedUrls.push(url);
    if (validatedUrls.length === 6) {
      cb(validatedUrls);
    }
  }
  if (urls) {
    for (i = 1; i < 7; i++) {
      validateSrc(urls[i], isImageCb);
    }
    return;
  }

  // `src` is a query selector to <a-cubemap> containing six $([src])s.
  aCubemap = validateAndGetQuerySelector(src);
  if (!aCubemap) { return; }
  if (aCubemap.tagName === 'A-CUBEMAP' && aCubemap.srcs) {
    return cb(aCubemap.srcs);
  }
  // Else if aCubeMap is not a <a-cubemap>.
  warn('Selector "%s" does not point to <a-cubemap>', src);
}

/**
 * Parses src from `url(src)`.
 * @param  {string} src - String to parse.
 * @return {string} The parsed src, if parseable.
 */
function parseUrl (src) {
  var parsedSrc = src.match(/\url\((.+)\)/);
  if (!parsedSrc) { return; }
  return parsedSrc[1];
}

/**
 * Validate src is a valid image url
 * @param  {string} src - url that will be tested
 * @param  {function} onResult - callback with the test result
 */
function validateImageUrl (src, onResult) {
  var tester = new Image();
  tester.addEventListener('load', onLoad);
  function onLoad () { onResult(true); }
  tester.addEventListener('error', onError);
  function onError () { onResult(false); }
  tester.src = src;
}

/**
 * Query and validate a query selector,
 *
 * @param  {string} selector - DOM selector.
 * @return {object|null|undefined} Selected DOM element if exists.
           null if query yields no results.
           undefined if `selector` is not a valid selector.
 */
function validateAndGetQuerySelector (selector) {
  try {
    var el = document.querySelector(selector);
    if (!el) {
      warn('No element was found matching the selector: "%s"', selector);
    }
    return el;
  } catch (e) {  // Capture exception if it's not a valid selector.
    warn('"%s" is not a valid selector', selector);
    return undefined;
  }
}

module.exports = {
  parseUrl: parseUrl,
  validateSrc: validateSrc,
  validateCubemapSrc: validateCubemapSrc
};
