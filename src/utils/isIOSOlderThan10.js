/**
 * Check if device is iOS and older than version 10.
 */
module.exports = function isIOSOlderThan10 (userAgent) {
  return /(iphone|ipod|ipad).*os.(7_|8_|9_)/i.test(userAgent);
};
