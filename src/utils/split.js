/**
 * String split with cached result.
 */
module.exports.split = (function () {
  var splitCache = {};

  return function (str, delimiter) {
    if (!(delimiter in splitCache)) { splitCache[delimiter] = {}; }

    if (str in splitCache[delimiter]) { return splitCache[delimiter][str]; }

    splitCache[delimiter][str] = str.split(delimiter);
    return splitCache[delimiter][str];
  };
})();
