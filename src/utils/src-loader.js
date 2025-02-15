/* global Image, XMLHttpRequest */
import debug from './debug.js';

var warn = debug('utils:src-loader:warn');

/**
 * Validate a texture, either as a selector or as a URL.
 * Detects whether `src` is pointing to an image or video and invokes the appropriate
 * callback.
 *
 * `src` will be passed into the callback
 *
 * @param {string|Element} src - URL or media element.
 * @param {function} isImageCb - callback if texture is an image.
 * @param {function} isVideoCb - callback if texture is a video.
 */
export function validateSrc (src, isImageCb, isVideoCb) {
  checkIsImage(src, function isAnImageUrl (isImage) {
    if (isImage) {
      isImageCb(src);
      return;
    }
    isVideoCb(src);
  });
}

/**
 * Validates either six images as a cubemap or one image as an Equirectangular image.
 *
 * @param {string} src - A selector, image URL or comma-separated image URLs. Image URLS
          must be wrapped by `url()`.
 * @param {function} isCubemapCb - callback if src is a cubemap.
 * @param {function} isEquirectCb - callback if src is a singular equirectangular image.
 */
export function validateEnvMapSrc (src, isCubemapCb, isEquirectCb) {
  var el;
  var cubemapSrcRegex = '';
  var i;
  var urls;
  var validatedUrls = [];

  if (typeof src === 'string') {
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
        isCubemapCb(validatedUrls);
      }
    }
    if (urls) {
      for (i = 1; i < 7; i++) {
        validateSrc(parseUrl(urls[i]), isImageCb);
      }
      return;
    }

    // Single URL src
    if (!src.startsWith('#')) {
      var parsedSrc = parseUrl(src);
      if (parsedSrc) {
        validateSrc(parsedSrc, isEquirectCb);
      } else {
        validateSrc(src, isEquirectCb);
      }
      return;
    }
  }

  // `src` is either an element or a query selector to an element (<a-cubemap> or <img>).
  if (src.tagName) {
    el = src;
  } else {
    el = validateAndGetQuerySelector(src);
  }

  if (!el) { return; }
  if (el.tagName === 'A-CUBEMAP' && el.srcs) {
    return isCubemapCb(el.srcs);
  }
  if (el.tagName === 'IMG') {
    return isEquirectCb(el);
  }
  // Else if el is not a valid element, either <a-cubemap> or <img>.
  warn('Selector "%s" does not point to <a-cubemap> or <img>', src);
}

/**
 * Validates six images as a cubemap, either as selector or comma-separated
 * URLs.
 *
 * @param {string} src - A selector or comma-separated image URLs. Image URLs
          must be wrapped by `url()`.
 * @param {function} cb - callback if src is a cubemap.
 */
export function validateCubemapSrc (src, cb) {
  return validateEnvMapSrc(src, cb, function isEquirectCb () {
    warn('Expected cubemap but got image');
  });
}

/**
 * Parses src from `url(src)`.
 * @param  {string} src - String to parse.
 * @returns {string} The parsed src, if parseable.
 */
export function parseUrl (src) {
  var parsedSrc = src.match(/url\((.+)\)/);
  if (!parsedSrc) { return; }
  return parsedSrc[1];
}

/**
 * Call back whether `src` is an image.
 *
 * @param {string|Element} src - URL or element that will be tested.
 * @param {function} onResult - Callback with whether `src` is an image.
 */
function checkIsImage (src, onResult) {
  var request;

  if (src.tagName) {
    onResult(src.tagName === 'IMG');
    return;
  }
  request = new XMLHttpRequest();

  // Try to send HEAD request to check if image first.
  request.open('HEAD', src);
  request.addEventListener('load', function (event) {
    var contentType;
    if (request.status >= 200 && request.status < 300) {
      contentType = request.getResponseHeader('Content-Type');
      if (contentType == null) {
        checkIsImageFallback(src, onResult);
      } else {
        if (contentType.startsWith('image')) {
          onResult(true);
        } else {
          onResult(false);
        }
      }
    } else {
      checkIsImageFallback(src, onResult);
    }
    request.abort();
  });
  request.send();
}

function checkIsImageFallback (src, onResult) {
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
 * @param {string} selector - DOM selector.
 * @returns {object|null|undefined} Selected DOM element if exists.
 *          null if query yields no results.
 *          undefined if `selector` is not a valid selector.
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
