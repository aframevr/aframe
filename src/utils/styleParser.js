/**
 * Utils for parsing style-like strings (e.g., "primitive: box; width: 5; height: 4.5").
 * Some code adapted from `style-attr` (https://github.com/joshwnj/style-attr)
 * by Josh Johnston (MIT License).
 */
var DASH_REGEX = /-([a-z])/g;

/**
 * Deserialize style-like string into an object of properties.
 *
 * @param {string} value - HTML attribute value.
 * @param {object} [obj] - Reused object for object pooling.
 * @returns {object} Property data.
 */
export function parse (value, obj) {
  var parsedData;
  if (typeof value !== 'string') { return value; }
  parsedData = styleParse(value, obj);
  // The style parser returns an object { "" : "test"} when fed a string
  if (parsedData['']) { return value; }
  return parsedData;
}

/**
 * Serialize an object of properties into a style-like string.
 *
 * @param {object} data - Property data.
 * @returns {string}
 */
export function stringify (data) {
  if (typeof data === 'string') { return data; }
  return styleStringify(data);
}

/**
 * Converts string from hyphen to camelCase.
 *
 * @param {string} str - String to camelCase.
 * @returns {string} CamelCased string.
 */
export function toCamelCase (str) {
  return str.replace(DASH_REGEX, upperCase);
}

/**
 * Split a string into chunks matching `<key>: <value>`
 */
var getKeyValueChunks = (function () {
  var chunks = [];
  var hasUnclosedUrl = /url\([^)]+$/;

  return function getKeyValueChunks (raw) {
    var chunk = '';
    var nextSplit;
    var offset = 0;
    var sep = ';';

    chunks.length = 0;

    while (offset < raw.length) {
      nextSplit = raw.indexOf(sep, offset);
      if (nextSplit === -1) { nextSplit = raw.length; }

      chunk += raw.substring(offset, nextSplit);

      // data URIs can contain semicolons, so make sure we get the whole thing
      if (hasUnclosedUrl.test(chunk)) {
        chunk += ';';
        offset = nextSplit + 1;
        continue;
      }

      chunks.push(chunk.trim());
      chunk = '';
      offset = nextSplit + 1;
    }

    return chunks;
  };
})();

/**
 * Convert a style attribute string to an object.
 *
 * @param {object} str - Attribute string.
 * @param {object} [obj] - Object to reuse as a base, else a new one will be allocated.
 */
function styleParse (str, obj) {
  var chunks;
  var i;
  var item;
  var pos;
  var key;
  var val;

  obj = obj || {};

  chunks = getKeyValueChunks(str);
  for (i = 0; i < chunks.length; i++) {
    item = chunks[i];
    if (!item) { continue; }
    // Split with `.indexOf` rather than `.split` because the value may also contain colons.
    pos = item.indexOf(':');
    key = item.substr(0, pos).trim();
    val = item.substr(pos + 1).trim();
    obj[toCamelCase(key)] = val;
  }
  return obj;
}

/**
 * Convert an object into an attribute string
 **/
function styleStringify (obj) {
  var key;
  var keyCount = 0;
  var i = 0;
  var str = '';

  for (key in obj) { keyCount++; }

  for (key in obj) {
    str += (key + ': ' + obj[key]);
    if (i < keyCount - 1) { str += '; '; }
    i++;
  }
  return str;
}

function upperCase (str) { return str[1].toUpperCase(); }
