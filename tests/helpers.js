/* Test helpers. */

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
