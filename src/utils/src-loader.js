/* global Image */
var utils = require('./vr-utils');

/**
 * Loads an image/video src.
 * If it's a CSS selector, we check if it's a valid one
 * If it's an URL, we check if it's a valid image or video
 *
 * @params {string} src - A CSS selector or an url to load
 * @params {function} loadImage - function to load an image
 * @params {function} loadVideo - function to load a video
 */
function loadSrc (src, loadImage, loadVideo) {
  var textureEl;
  var isImage;
  var isVideo;
  var url = parseURL(src);
  // if src is a url
  if (url) {
    isImageURL(url, function isAnImageURL (isImage) {
      if (!isImage) { loadVideo(url); return; }
      loadImage(url);
    });
    return;
  }
  // if src is a CSS Selector
  textureEl = getEl(src);
  if (!textureEl) {
    if (textureEl === null) {
      utils.warn('There is no element that matches the selector: "%s"', src);
    }
    return;
  }
  // If src is a valid selector
  isImage = textureEl && textureEl.tagName === 'IMG';
  isVideo = textureEl && textureEl.tagName === 'VIDEO';
  if (isImage) { loadImage(textureEl); return; }
  if (isVideo) { loadVideo(textureEl); return; }
  // src is a valid selector but doesn't match with a <img> or <video> element
  utils.warn('The provided source "%s" is not a valid <img> or <video> element', src);
}

/**
 * Parses a src string
 * @param  {string} src The src string to parse
 * @return {string}     The parsed src if the input can be parsed
 */
function parseURL (src) {
  var parsedSrc = src.match(/\url\((.+)\)/);
  if (!parsedSrc) { return; }
  return parsedSrc[1];
}

/**
 * Checks if src is a valid image url
 * @param  {string} src - url that will be tested
 * @param  {function} onResult - callback with the test result
 */
function isImageURL (src, onResult) {
  var tester = new Image();
  tester.addEventListener('load', onLoad);
  function onLoad () { onResult(true); }
  tester.addEventListener('error', onError);
  function onError () { onResult(false); }
  tester.src = src;
}

/**
 * Query an element and captures the exception in case of
 * an invalid selector
 * @param  {string} selector A CSS selector
 * @return {object}          The selected DOM element if any
 */
function getEl (selector) {
  try {
    return document.querySelector(selector);
  } catch (e) { // Capture exception if it's not a valid selector
    utils.warn('The provided source "%s" is not a valid CSS selector', selector);
    return undefined;
  }
}

module.exports = {
  loadSrc: loadSrc,
  parseURL: parseURL
};
