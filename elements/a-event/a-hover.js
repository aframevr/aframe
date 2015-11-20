var utils = require('../lib/utils');

/**
 * We `hover` by applying attributes upon `mouseenter` and then
 * rolling back the changes upon `mouseleave` of the element.
 */
module.exports = utils.wrapAEventElement('a-hover', 'mouseenter');
