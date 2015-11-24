/* global suite */

/**
 * Helper method to create a scene, create an entity, add entity to scene,
 * add scene to document.
 *
 * @returns {object} An `<a-entity>` element.
 */
module.exports.entityFactory = function () {
  var scene = document.createElement('a-scene');
  var entity = document.createElement('a-entity');
  scene.appendChild(entity);
  document.body.appendChild(scene);
  return entity;
};

/**
 * Creates and attaches a mixin element (and an `<a-assets>` element if necessary).
 *
 * @param {string} id - ID of mixin.
 * @param {object} obj - Map of component names to attribute values.
 * @returns {object} An attached `<a-mixin>` element.
 */
module.exports.mixinFactory = function (id, obj) {
  var mixinEl = document.createElement('a-mixin');
  mixinEl.setAttribute('id', id);
  Object.keys(obj).forEach(function (componentName) {
    mixinEl.setAttribute(componentName, obj[componentName]);
  });

  var assetsEl = document.querySelector('a-assets');
  if (!assetsEl) {
    assetsEl = document.createElement('a-assets');
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
