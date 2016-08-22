/**
 * Faster version of Function.prototype.bind
 * @param {Function} fn - Function to wrap.
 * @param {Object} ctx - What to bind as context.
 * @param {...*} arguments - Arguments to pass through.
 */
module.exports = function bind (fn, ctx/* , arg1, arg2 */) {
  return (function (prependedArgs) {
    return function bound () {
      // Concat the bound function arguments with those passed to original bind
      var args = prependedArgs.concat(Array.prototype.slice.call(arguments, 0));
      return fn.apply(ctx, args);
    };
  })(Array.prototype.slice.call(arguments, 2));
};
