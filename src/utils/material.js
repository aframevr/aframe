/**
 * Set material texture and update if necessary.
 *
 * @param {object} material
 * @param {object} texture
 */
module.exports.updateMaterialTexture = function (material, texture) {
  var oldMap = material.map;
  if (texture) { texture.needsUpdate = true; }
  material.map = texture;

  // Only need to update three.js material if presence or not of texture has changed.
  if (oldMap === null && material.map || material.map === null && oldMap) {
    material.needsUpdate = true;
  }
};
