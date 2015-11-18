/* global suite */

/**
 * Helper method to create a scene, create an object, add object to scene,
 * add scene to document.
 *
 * @returns {object} A <vr-object> element.
 */
module.exports.entityFactory = function () {
  var scene = document.createElement('vr-scene');
  var object = document.createElement('vr-object');
  scene.appendChild(object);
  document.body.appendChild(scene);
  return object;
};

/**
 * Creates and attaches a mixin element (and a vr-assets element if necessary).
 *
 * @param {string} id - ID of mixin.
 * @param {object} obj - Map of component names to attribute values.
 * @returns {object} An attached <vr-mixin> element.
 */
module.exports.mixinFactory = function (id, obj) {
  var mixinEl = document.createElement('vr-mixin');
  mixinEl.setAttribute('id', id);
  Object.keys(obj).forEach(function (componentName) {
    mixinEl.setAttribute(componentName, obj[componentName]);
  });

  var assetsEl = document.querySelector('vr-assets');
  if (!assetsEl) {
    assetsEl = document.createElement('vr-assets');
    document.body.appendChild(assetsEl);
  }
  assetsEl.appendChild(mixinEl);

  return mixinEl;
};

/**
 * Test that is only run locally and is skipped on CI.
 */
module.exports.getSkipCISuite = function () {
  if (window.__env__.TEST_ENV === 'ci') {
    return suite.skip;
  } else {
    return suite;
  }
};
