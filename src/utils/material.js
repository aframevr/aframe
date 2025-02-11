/* global HTMLCanvasElement, HTMLVideoElement */
import THREE from '../lib/three.js';
import * as srcLoader from './src-loader.js';
import debug from './debug.js';
var warn = debug('utils:material:warn');

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
export function setTextureProperties (texture, data) {
  var offset = data.offset || {x: 0, y: 0};
  var repeat = data.repeat || {x: 1, y: 1};
  var npot = data.npot || false;
  var anisotropy = data.anisotropy || THREE.Texture.DEFAULT_ANISOTROPY;
  var wrapS = texture.wrapS;
  var wrapT = texture.wrapT;
  var magFilter = texture.magFilter;
  var minFilter = texture.minFilter;

  // To support NPOT textures, wrap must be ClampToEdge (not Repeat),
  // and filters must not use mipmaps (i.e. Nearest or Linear).
  if (npot) {
    wrapS = THREE.ClampToEdgeWrapping;
    wrapT = THREE.ClampToEdgeWrapping;
    magFilter = THREE.LinearFilter;
    minFilter = THREE.LinearFilter;
  }

  // Set wrap mode to repeat only if repeat isn't 1/1. Power-of-two is required to repeat.
  if (repeat.x !== 1 || repeat.y !== 1) {
    wrapS = THREE.RepeatWrapping;
    wrapT = THREE.RepeatWrapping;
  }

  // Apply texture properties
  texture.offset.set(offset.x, offset.y);
  texture.repeat.set(repeat.x, repeat.y);

  if (texture.wrapS !== wrapS || texture.wrapT !== wrapT ||
      texture.magFilter !== magFilter || texture.minFilter !== minFilter ||
      texture.anisotropy !== anisotropy) {
    texture.wrapS = wrapS;
    texture.wrapT = wrapT;
    texture.magFilter = magFilter;
    texture.minFilter = minFilter;
    texture.anisotropy = anisotropy;
    texture.needsUpdate = true;
  }
}

/**
 * Update `material` texture property (usually but not always `map`)
 * from `data` property (usually but not always `src`).
 *
 * @param {object} shader - A-Frame shader instance.
 * @param {object} data
 */
export function updateMapMaterialFromData (materialName, dataName, shader, data) {
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
    // Remove the texture from the material.
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
    // Load texture source for the new material src.
    // (And check if we should still use it once available in callback.)
    el.sceneEl.systems.material.loadTextureSource(src, updateTexture);
  }

  function updateTexture (source) {
    // If the source has been changed, don't use loaded texture.
    if (shader.materialSrcs[materialName] !== src) { return; }

    var texture = material[materialName];

    // Handle removal or texture type change
    if (texture && (source === null || !isCompatibleTexture(texture, source))) {
      texture = null;
    }

    // Create texture if needed
    if (!texture && source) {
      texture = createCompatibleTexture(source);
    }

    // Update texture source and properties
    if (texture) {
      if (texture.source !== source) {
        texture.source = source;
        texture.needsUpdate = true;
      }
      if (COLOR_MAPS.has(materialName)) {
        rendererSystem.applyColorCorrection(texture);
      }
      setTextureProperties(texture, data);
    }

    // Set map property on the material
    setMap(texture);
  }

  function setMap (texture) {
    // Nothing to do if texture is the same
    if (material[materialName] === texture) {
      return;
    }

    // Dispose old texture if present
    if (material[materialName]) {
      material[materialName].dispose();
    }

    material[materialName] = texture;
    material.needsUpdate = true;
    handleTextureEvents(el, texture);
  }
}

/**
 * Update `material.map` given `data.src`. For standard and flat shaders.
 *
 * @param {object} shader - A-Frame shader instance.
 * @param {object} data
 */
export function updateMap (shader, data) {
  return updateMapMaterialFromData('map', 'src', shader, data);
}

/**
 * Updates the material's maps which give the illusion of extra geometry.
 *
 * @param {string} longType - The friendly name of the map from the component e.g. ambientOcclusionMap becomes aoMap in THREE.js
 * @param {object} shader - A-Frame shader instance
 * @param {object} data
 */
export function updateDistortionMap (longType, shader, data) {
  var shortType = longType;
  if (longType === 'ambientOcclusion') { shortType = 'ao'; }

  var info = {};
  info.src = data[longType + 'Map'];

  // Pass through the repeat and offset to be handled by the material loader.
  info.offset = data[longType + 'TextureOffset'];
  info.repeat = data[longType + 'TextureRepeat'];
  info.wrap = data[longType + 'TextureWrap'];
  return updateMapMaterialFromData(shortType + 'Map', 'src', shader, info);
}

// Cache env map results as promises
var envMapPromises = {};

/**
 * Updates the material's environment map providing reflections or refractions.
 *
 * @param {object} shader - A-Frame shader instance
 * @param {object} data
 */
export function updateEnvMap (shader, data) {
  var material = shader.material;
  var el = shader.el;
  var materialName = 'envMap';
  var src = data.envMap;
  var sphericalEnvMap = data.sphericalEnvMap;
  var refract = data.refract;

  if (sphericalEnvMap) {
    src = sphericalEnvMap;
    warn('`sphericalEnvMap` property is deprecated, using spherical map as equirectangular map instead. ' +
      'Use `envMap` property with a CubeMap or Equirectangular image instead.');
  }

  if (!shader.materialSrcs) { shader.materialSrcs = {}; }

  // EnvMap has been removed
  if (!src) {
    // Forget the prior material src.
    delete shader.materialSrcs[materialName];
    material.envMap = null;
    material.needsUpdate = true;
    return;
  }

  // Remember the new src for this env map.
  shader.materialSrcs[materialName] = src;

  // Env map is already loading. Wait on promise.
  if (envMapPromises[src]) {
    envMapPromises[src].then(checkSetMap);
    return;
  }

  // First time loading this env map.
  envMapPromises[src] = new Promise(function (resolve) {
    srcLoader.validateEnvMapSrc(src, function loadCubeMap (srcs) {
      el.sceneEl.systems.material.loadCubeMapTexture(srcs, function (texture) {
        texture.mapping = refract ? THREE.CubeRefractionMapping : THREE.CubeReflectionMapping;
        checkSetMap(texture);
        resolve(texture);
      });
    }, function loadEquirectMap (src) {
      el.sceneEl.systems.material.loadTexture(src, {src: src}, function (texture) {
        texture.mapping = refract ? THREE.EquirectangularRefractionMapping : THREE.EquirectangularReflectionMapping;
        checkSetMap(texture);
        resolve(texture);
      });
    });
  });

  function checkSetMap (texture) {
    if (shader.materialSrcs[materialName] !== src) { return; }
    material.envMap = texture;
    material.needsUpdate = true;
    handleTextureEvents(el, texture);
  }
}

/**
 * Emit event on entities on texture-related events.
 *
 * @param {Element} el - Entity.
 * @param {object} texture - three.js Texture.
 */
export function handleTextureEvents (el, texture) {
  if (!texture) { return; }

  el.emit('materialtextureloaded', {src: texture.image, texture: texture});

  // Video events.
  if (!texture.image || texture.image.tagName !== 'VIDEO') { return; }

  texture.image.addEventListener('loadeddata', emitVideoTextureLoadedDataAll);
  texture.image.addEventListener('ended', emitVideoTextureEndedAll);
  function emitVideoTextureLoadedDataAll () {
    el.emit('materialvideoloadeddata', {src: texture.image, texture: texture});
  }
  function emitVideoTextureEndedAll () {
    // Works for non-looping videos only.
    el.emit('materialvideoended', {src: texture.image, texture: texture});
  }

  // Video source can outlive texture, so cleanup event listeners when texture is disposed
  texture.addEventListener('dispose', function cleanupListeners () {
    texture.image.removeEventListener('loadeddata', emitVideoTextureLoadedDataAll);
    texture.image.removeEventListener('ended', emitVideoTextureEndedAll);
  });
}

/**
 * Checks if a given texture type is compatible with a given source.
 *
 * @param {THREE.Texture} texture - The texture to check compatibility with
 * @param {THREE.Source} source - The source to check compatibility with
 * @returns {boolean} True if the texture is compatible with the source, false otherwise
 */
export function isCompatibleTexture (texture, source) {
  if (texture.source !== source) {
    return false;
  }

  if (source.data instanceof HTMLCanvasElement) {
    return texture.isCanvasTexture;
  }

  if (source.data instanceof HTMLVideoElement) {
    return texture.isVideoTexture;
  }

  return texture.isTexture && !texture.isCanvasTexture && !texture.isVideoTexture;
}

export function createCompatibleTexture (source) {
  var texture;

  if (source.data instanceof HTMLCanvasElement) {
    texture = new THREE.CanvasTexture();
  } else if (source.data instanceof HTMLVideoElement) {
    // Pass underlying video to constructor to ensure requestVideoFrameCallback is setup
    texture = new THREE.VideoTexture(source.data);
  } else {
    texture = new THREE.Texture();
  }

  texture.source = source;
  texture.needsUpdate = true;
  return texture;
}

var HLS_MIMETYPES = ['application/x-mpegurl', 'application/vnd.apple.mpegurl'];

/**
 * Given video element src and type, guess whether stream is HLS.
 *
 * @param {string} src - src from video element (generally URL to content).
 * @param {string} type - type from video element (generally MIME type if present).
 */
export function isHLS (src, type) { 
  if (type && HLS_MIMETYPES.includes(type.toLowerCase())) { return true; }
  if (src && src.toLowerCase().indexOf('.m3u8') > 0) { return true; }
  return false;
};
