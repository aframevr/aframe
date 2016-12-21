var THREE = require('../lib/three');

/**
 * Update `material.map` given `data.src`. For standard and flat shaders.
 *
 * @param {object} shader - A-Frame shader instance.
 * @param {object} data
 */
module.exports.updateMapMaterialFromData = function (materialName, dataName, shader, data) {
  var el = shader.el;
  var material = shader.material;
  var src = data[dataName];
  var shadowSrcName = '_texture_' + dataName;

  if (src) {
    if (src === shader[shadowSrcName]) { return; }
    // Texture added or changed.
    shader[shadowSrcName] = src;
    if (src instanceof THREE.Texture) { setMap(src); return; }
    el.sceneEl.systems.material.loadTexture(src, {src: src, repeat: data.repeat, offset: data.offset, npot: data.npot}, setMap);
    return;
  }

  // Texture removed.
  if (!material[materialName]) { return; }
  shader[shadowSrcName] = null;
  setMap(null);

  function setMap (texture) {
    if (shader[shadowSrcName] !== src) { return; }
    material[materialName] = texture;
    material.needsUpdate = true;
    handleTextureEvents(el, texture);
  }
};

/**
 * Update `material.map` given `data.src`. For standard and flat shaders.
 *
 * @param {object} shader - A-Frame shader instance.
 * @param {object} data
 */
module.exports.updateMap = function (shader, data) {
  return module.exports.updateMapMaterialFromData('map', 'src', shader, data);
};

/**
 * Updates the material's maps which give the illusion of extra geometry.
 *
 * @param {string} longType - The friendly name of the map from the component e.g. ambientOcclusionMap becomes aoMap in THREE.js
 * @param {object} shader - A-Frame shader instance
 * @param {object} data
 */
module.exports.updateDistortionMap = function (longType, shader, data) {
  var shortType = longType;
  if (longType === 'ambientOcclusion') { shortType = 'ao'; }
  var el = shader.el;
  var material = shader.material;
  var src = data[longType + 'Map'];
  var info = {};
  info.src = src;

  // Pass through the repeat and offset to be handled by the material loader.
  info.offset = data[longType + 'TextureOffset'];
  info.repeat = data[longType + 'TextureRepeat'];
  info.wrap = data[longType + 'TextureWrap'];

  if (src) {
    if (src === shader[longType + 'TextureSrc']) { return; }

    // Texture added or changed.
    shader[longType + 'TextureSrc'] = src;
    el.sceneEl.systems.material.loadTexture(src, info, setMap);
    return;
  }

  // Texture removed.
  if (!material.map) { return; }
  setMap(null);

  function setMap (texture) {
    material[shortType + 'Map'] = texture;
    material.needsUpdate = true;
    handleTextureEvents(el, texture);
  }
};

/**
 * Emit event on entities on texture-related events.
 *
 * @param {Element} el - Entity.
 * @param {object} texture - three.js Texture.
 */
function handleTextureEvents (el, texture) {
  if (!texture) { return; }

  el.emit('materialtextureloaded', {src: texture.image, texture: texture});

  // Video events.
  if (!texture.image || texture.image.tagName !== 'VIDEO') { return; }
  texture.image.addEventListener('loadeddata', function emitVideoTextureLoadedDataAll () {
    el.emit('materialvideoloadeddata', {src: texture.image, texture: texture});
  });
  texture.image.addEventListener('ended', function emitVideoTextureEndedAll () {
    // Works for non-looping videos only.
    el.emit('materialvideoended', {src: texture.image, texture: texture});
  });
}
module.exports.handleTextureEvents = handleTextureEvents;
