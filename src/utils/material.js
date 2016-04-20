var srcLoader = require('./src-loader');

/**
 * Update shader instance's `material.map` given `data.src`.
 *
 * @param {object} shader - A-Frame shader instance.
 * @param {object} data
 */
module.exports.updateMap = function (shader, data) {
  var el = shader.el;
  var src = data.src;
  var material = shader.material;
  var materialSystem = el.sceneEl.systems.material;

  if (src) {
    if (src === shader.mapSrc) { return; }
    // Texture added or changed.
    shader.mapSrc = src;
    srcLoader.validateSrc(
      src,
      function loadImageCb (src) { materialSystem.loadImage(el, material, data, src); },
      function loadVideoCb (src) { materialSystem.loadVideo(el, material, data, src); }
    );
    return;
  }

  // Texture removed.
  updateMaterialTexture(material, null);
};

/**
 * Set material texture and update if necessary.
 *
 * @param {object} material
 * @param {object} texture
 */
function updateMaterialTexture (material, texture) {
  var oldMap = material.map;
  if (texture) { texture.needsUpdate = true; }
  material.map = texture;

  // Only need to update three.js material if presence or not of texture has changed.
  if (oldMap === null && material.map || material.map === null && oldMap) {
    material.needsUpdate = true;
  }
}
module.exports.updateMaterialTexture = updateMaterialTexture;
