/* global CustomEvent */

/**
 * Fires a custom DOM event.
 *
 * @param {Element} el Element on which to fire the event.
 * @param {String} name Name of the event.
 * @param {Object=} [data={bubbles: true, {detail: <el>}}]
 *   Data to pass as `customEventInit` to the event.
 */
module.exports.fireEvent = function (el, name, data) {
  data = data || {};
  data.detail = data.detail || {};
  data.detail.target = data.detail.target || el;
  var evt = new CustomEvent(name, data);
  evt.target = el;
  el.dispatchEvent(evt);
};

/**
 * Throws an error given a message.
 *
 * @param {String} msg Error message.
 */
module.exports.error = function (msg) {
  throw new Error(msg);
};

/**
 * Emits a console warning given passed message argument(s).
 */
module.exports.warn = function () {
  console.warn.apply(console, arguments);
};

/**
 * Emits a console log given passed message argument(s).
 */
module.exports.log = function () {
  console.log.apply(console, arguments);
};

/**
 * It mixes properties of source object into dest
 * @param  {object} dest   The object where properties will be copied TO
 * @param  {object} source The object where properties will be copied FROM
 */
module.exports.mixin = function (dest, source) {
  var keys;
  if (!source) { return dest; }
  keys = Object.keys(source);
  keys.forEach(mix);
  function mix (key) {
    dest[key] = source[key];
  }
  return dest;
};

/**
 * Given a coordinate in a string form "0 0 0"
 * It returns the coordinate parsed as an object
 * {x: 3, y: 4, z: -10}.
 *
 * @param  {string} value        String to parse.
 * @param  {object} default      contains the coordinate default values.
 * @return {object}              Parsed coordinate.
 */
module.exports.parseCoordinate = function (value, defaults) {
  defaults = defaults || {};
  if (typeof value !== 'string') { return value; }
  var values = value.split(' ');
  return {
    x: parseFloat(values[0] || defaults.x),
    y: parseFloat(values[1] || defaults.y),
    z: parseFloat(values[2] || defaults.z)
  };
};

/**
 * It coerces the strings of the obj object into the types of the schema object
 * In the case of a primitive value obj is coerced to the type of schema
 * @param  {} dest   The object that contains the string values to be coerced
 * @param  {} schema It contains the type or types
 */
module.exports.coerce = function (obj, schema) {
  var keys = Object.keys(obj);
  if (typeof obj !== 'object') { return coerceValue(obj, schema); }
  keys.forEach(coerce);
  return obj;
  function coerce (key) {
    var value = schema[key];
    var type = typeof value;
    if (value === undefined) { return; }
    obj[key] = coerceValue(obj[key], type);
  }
  function coerceValue (value, type) {
    if (typeof value !== 'string') { return value; }
    switch (type) {
      case 'boolean':
        return value === 'true';
      case 'number':
        return parseFloat(value);
      default:
        return value;
    }
  }
};

/**
 * Checks if a and b objects have the same attributes and the values
 * are equal. In the case of primitive types the values are compared directly
 * @param  {} a
 * @param  {} b
 * @return {boolean}   True if objects are equal. False otherwise
 */
module.exports.deepEqual = function (a, b) {
  var keysA = Object.keys(a);
  var keysB = Object.keys(b);
  var i;
  if (keysA.length !== keysB.length) { return false; }
  // If there are no keys we just compare the objects
  if (keysA.length === 0) { return a === b; }
  for (i = 0; i < keysA.length; ++i) {
    if (a[keysA[i]] !== b[keysA[i]]) { return false; }
  }
  return true;
};

/**
 * Checks if browser is mobile.
 * @return {Boolean} True if mobile browser detected.
 */
module.exports.isMobile = function () {
  var check = false;
  (function (a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
      check = true;
    }
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};
