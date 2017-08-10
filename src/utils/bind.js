/**
 * Simple and faster version of Function.prototype.bind.
 *
 * @param {Function} fn - Function to wrap.
 * @param {Object} ctx - What to bind as context.
 */
module.exports = function bind (fn, ctx) {
  return function bound () {
    return fn.apply(ctx, arguments);
  };
};
