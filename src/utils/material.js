var THREE = require('../lib/three');

var HLS_MIMETYPES = ['application/x-mpegurl', 'application/vnd.apple.mpegurl'];

var COLOR_MAPS = new Set([
  'emissiveMap',
  'envMap',
  'map',
  'specularMap'
]);

/**
 * Set texture properties such as repeat and offset.
 *
 * @param {object} data - With keys like `repeat`.
*/
function setTextureProperties (texture, data) {
  var offset = data.offset || {x: 0, y: 0};
  var repeat = data.repeat || {x: 1, y: 1};
  var npot = data.npot || false;
  var anisotropy = data.anisotropy || 0;
  // To support NPOT textures, wrap must be ClampToEdge (not Repeat),
  // and filters must not use mipmaps (i.e. Nearest or Linear).
  if (npot) {
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
  }

  // Don't bother setting repeat if it is 1/1. Power-of-two is required to repeat.
  if (repeat.x !== 1 || repeat.y !== 1) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeat.x, repeat.y);
  }
  // Don't bother setting offset if it is 0/0.
  if (offset.x !== 0 || offset.y !== 0) {
    texture.offset.set(offset.x, offset.y);
  }

  // Only set anisotropy if it isn't 0, which indicates that the default value should be used.
  if (anisotropy !== 0) {
    texture.anisotropy = anisotropy;
  }
}
module.exports.setTextureProperties = setTextureProperties;

/**
 * Update `material` texture property (usually but not always `map`)
 * from `data` property (usually but not always `src`).
 *
 * @param {object} shader - A-Frame shader instance.
 * @param {object} data
 */
module.exports.updateMapMaterialFromData = function (materialName, dataName, shader, data) {
  var el = shader.el;
  var material = shader.material;
  var rendererSystem = el.sceneEl.systems.renderer;
  var src = data[dataName];

  // Because a single material / shader may have multiple textures,
  // we need to remember the source value for this data property
  // to avoid redundant operations which can be expensive otherwise
  // (e.g. video texture loads).
  if (!shader.materialSrcs) { shader.materialSrcs = {}; }

  if (!src) {
    // Forget the prior material src.
    delete shader.materialSrcs[materialName];
    // Remove the texture.
    setMap(null);
    return;
  }

  // If material src hasn't changed, and we already have a texture,
  // just update properties, but don't reload the texture.
  if (src === shader.materialSrcs[materialName] &&
      material[materialName]) {
    setTextureProperties(material[materialName], data);
    return;
  }

  // Remember the new src for this texture (there may be multiple).
  shader.materialSrcs[materialName] = src;

  // If the new material src is already a texture, just use it.
  if (src instanceof THREE.Texture) { setMap(src); } else {
    // Load texture for the new material src.
    // (And check if we should still use it once available in callback.)
    el.sceneEl.systems.material.loadTexture(src,
      {src: src, repeat: data.repeat, offset: data.offset, npot: data.npot, anisotropy: data.anisotropy},
      checkSetMap);
  }

  function checkSetMap (texture) {
    // If the source has been changed, don't use loaded texture.
    if (shader.materialSrcs[materialName] !== src) { return; }
    setMap(texture);
  }

  function setMap (texture) {
    material[materialName] = texture;
    if (texture && COLOR_MAPS.has(materialName)) {
      rendererSystem.applyColorCorrection(texture);
    }
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
  var rendererSystem = el.sceneEl.systems.renderer;
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
    var slot = shortType + 'Map';
    material[slot] = texture;
    if (texture && COLOR_MAPS.has(slot)) {
      rendererSystem.applyColorCorrection(texture);
    }
    if (texture) {
      setTextureProperties(texture, data);
    }
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
    // Check to see if we need to use iOS 10 HLS shader.
    // Only override the shader if it is stock shader that we know doesn't correct.
    if (!el.components || !el.components.material) { return; }

    if (texture.needsCorrectionBGRA && texture.needsCorrectionFlipY &&
        ['standard', 'flat'].indexOf(el.components.material.data.shader) !== -1) {
      el.setAttribute('material', 'shader', 'ios10hls');
    }

    el.emit('materialvideoloadeddata', {src: texture.image, texture: texture});
  });
  texture.image.addEventListener('ended', function emitVideoTextureEndedAll () {
    // Works for non-looping videos only.
    el.emit('materialvideoended', {src: texture.image, texture: texture});
  });
}
module.exports.handleTextureEvents = handleTextureEvents;

/**
 * Given video element src and type, guess whether stream is HLS.
 *
 * @param {string} src - src from video element (generally URL to content).
 * @param {string} type - type from video element (generally MIME type if present).
 */
module.exports.isHLS = function (src, type) {
  if (type && HLS_MIMETYPES.includes(type.toLowerCase())) { return true; }
  if (src && src.toLowerCase().indexOf('.m3u8') > 0) { return true; }
  return false;
};
